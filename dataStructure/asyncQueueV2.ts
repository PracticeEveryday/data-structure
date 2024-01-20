class QueueEvent extends Event {
    public detail?: any;

    constructor (name: string, detail: any) {
        super(name);
        this.detail = detail;
    }
}

/**
 * 이벤트 생성 시점
 * 1. end: done 함수 호출 시
 * 2. error: job의 실행 결과가 error일 경우
 *             1. job에 전달된 콜백 함수 next에 첫 번째 인자 값이 넘어올 떄
 *
 * 3. success: job의 실행 결과가 success일 경우
 *             1. timeout이 되지 않았을 때
 *             2. job에 전달된 콜백 함수 next에 두 번째 인자 값이 넘어올 떄
 *
 * 4. timeout: 비동기 함수 실행 결과가 설정한 timeout 시간을 넘겼을 때 <- timeout시 next 함수를 넘겨준다.
 * 5. start: job이 실행 될 때
 */
class AsyncEventQueue extends EventTarget {
    public autostart: boolean = false;
    public running: boolean = false;
    public isStopOnFailure: boolean = true;

    public session: number= 0;
    public pending: number = 0;
    public timeout: number = 0;
    public concurrency: number = Infinity;

    public jobs: any[] = [];
    public successResults: any[] = [];
    public errorResultList: any[] = [];
    public timers: any[] = [];

    constructor(options: {autostart?: boolean, concurrency?: number, timeout?: number, isStopOnFailure?: boolean}) {
        super();
        // 자동으로 시작할 것인가?
        if(options.autostart) this.autostart = options.autostart;

        // 동시에 몇개의 작업까지 할 것인가?
        if(options.concurrency) this.concurrency = options.concurrency;

        // 제한 시간은 얼마나 줄 것인가.
        if(options.timeout) this.timeout = options.timeout;

        // 실패 시 중지 여부 (default true)
        if(options.isStopOnFailure === false) this.isStopOnFailure = options.isStopOnFailure;

        // 에러 핸들러 등록하기
        this.addEventListener('error', this._errorHandler);
    }


    public push (...workers: any[]) {
        const methodResult = this.jobs.push(...workers);
        if (this.autostart) this._start();
        return methodResult;
    }

    public start(callback?) {
        if(this.running) throw new Error("이미 시작되었습니다.");
        let awaiter;
        if(callback) {
            this._addCallbackToEndEvent(callback);
        } else {
            awaiter = this._createPromiseToEndEvent();
        }

        this._start();
        return awaiter;
    }

    done (error?: any) {
        this.session++;
        this.running = false;
        this.dispatchEvent(new QueueEvent('end', { error }));
    }



    private _createPromiseToEndEvent () {
        return new Promise((resolve, reject) => {
            this._addCallbackToEndEvent((error, successResults) => {
                if (error) reject(error)
                else resolve(successResults)
            })
        })
    }

    private _addCallbackToEndEvent (cb) {
        const onend = event => {
            this.removeEventListener('end', onend);
            cb(event.detail.error, this.successResults);
        }
        this.addEventListener('end', onend);
    }

    private _start () {
        this.running = true;

        // 기다리고 있는 개수가 동시에 실행할 개수보다 많으면 return
        if (this.pending >= this.concurrency) return;


        if (this.jobs.length === 0) {
            if (this.pending === 0) this.done();
            return;
        }

        const job = this.jobs.shift();
        const session = this.session;

        // job과 job에 타임아웃 프로퍼티가 있으면 job의 타임아웃을 따라간다.
        const timeout = (job && Object.prototype.hasOwnProperty.call(job, 'timeout') ? job.timeout : this.timeout);


        let timeoutId: any = null;
        let didTimeout = false;
        let resultIndex: any = null;

        const next = (error?, ...result: any[]) => {
            let once = true;
            // 처음 시작되는 거라면
            if(once && this.session === session) {
                once = false;
                this.pending--;

                // 시간 초과 된 아이디가 있다면
                if(timeoutId !== null) {
                    this.timers = this.timers.filter(tId => tId !== timeoutId);
                    clearTimeout(timeoutId);
                }

                // 에러라면! error 이벤트 발생
                if(error) {
                    this.dispatchEvent(new QueueEvent('error', {error, job}));

                    // 에러가 아니고 타임아웃이 아니면 성공 처리한다.
                } else if(!didTimeout) {
                    // resultIndex가 있고 결과값이 없으면 결과값을 만들어 준다.
                    if(resultIndex !== null && this.successResults !== null) {
                        this.successResults[resultIndex] = [...result];
                    }
                    this.dispatchEvent(new QueueEvent('success', {result: [...result], job}))
                }

                // 세션이 동일한 상태에서
                if(this.session === session) {
                    // 남아 있는 것이 없고 jobs의 길이가 0이라면 끝낸다.
                    if(this.pending === 0 && this.jobs.length === 0) {
                        this.done();

                        // 전행중이라면 다시 시작한다.
                    } else if (this.running) {
                        this._start();
                    }
                }
            }
        }

        // 시간초과 값이 있다면
        if(timeout) {
            timeoutId = setTimeout(() => {
                didTimeout = true;
                this.dispatchEvent(new QueueEvent('timeout', {next, job}));

                next();
            }, timeout);

            this.timers.push(timeoutId);
        }

        // successResults가 null이 아니면
        if(this.successResults !== null) {
            resultIndex = this.successResults.length;
            this.successResults[resultIndex] = null;
        }

        // pending 값을 추가하고 start 이벤트를 남긴다.
        this.pending++;
        this.dispatchEvent(new QueueEvent('start', { job }));

        //
        job.promise = job(next);
        if(job.promise !== undefined && typeof job.promise.then === 'function') {
            job.promise.then(function (result) {
                return next(undefined, result);
            }).catch(function (err) {
                return next(err || true);
            })
        }

        if(this.running && this.jobs.length > 0) {
            this._start();
        }
    }

    end (error) {
        this.clearTimers();
        this.jobs.length = 0;
        this.pending = 0;
        this.done(error);
    }

    clearTimers () {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
    }

    // TODO: 플래그를 전달 받아 에러 발생 시 실행을 멈출 것인지, 무시할 것인지 구현하는 로직 추가하기
    private _errorHandler(event: QueueEvent): void {
        if(this.isStopOnFailure){
            this.end(event.detail.error);
        }

        // 계속 진행할 시 errorList에 결과 넣어주기
        this.errorResultList.push({error: event.detail.error, job: event.detail.job});
    }
}






const queue = new AsyncEventQueue({autostart: false, concurrency: 2, timeout: 10, isStopOnFailure: false});
let timeouts = 0;

// --- event 등록
queue.addEventListener("success", (event: QueueEvent) => {
    console.log("success")
})

queue.addEventListener('timeout', (event: QueueEvent) => {
    timeouts++
    console.log("timeout");
    event.detail.next()
})

//-------test------------
// cb에는 next 함수가 들어옵니다.
const willTimeout = (cb) => {
    setTimeout(cb, 10)
}
const wontTimeout = (cb) => {
    setTimeout(cb, 10)
}

queue.push((cb) => {
    cb(undefined, 42)
})

queue.push((cb) => {
    cb("실패 테스트");
})

queue.push((cb) => {
    cb(undefined, 22)
})

queue.push((cb) => {
    cb(undefined, 333)
})

queue.push(willTimeout)
queue.push(wontTimeout)
queue.start();