import { queueDetailType } from "./eventQueueV2";
import {clearTimeout} from "timers";

class QueueEvent extends Event {
    public detail?: queueDetailType

    constructor (name: string, detail: any) {
        super(name)
        this.detail = detail;
    }
}

class AsyncEventQueue extends EventTarget {
    public jobs: any[] = [];
    public autostart: boolean = false;
    public running: boolean = false;
    public pending: number = 0;
    public concurrency: number = Infinity;
    public session: number= 0;
    public results: any = [];
    public timeout: number = 0;
    public timers: any[] = [];

    constructor(options: {autostart?: boolean, concurrency?: number, results?: any, timeout?: number}) {
        super();
        if(options.autostart) this.autostart = options.autostart;
        if(options.concurrency) this.concurrency = options.concurrency;
        if(options.results) this.results = options.results;
        if(options.timeout) this.timeout = options.timeout;
        this.addEventListener('error', this._errorHandler)
    }

    _errorHandler (evvent) {
        this.end(evvent.detail.error)
    }

    end (error) {
        this.clearTimers()
        this.jobs.length = 0
        this.pending = 0
        this.done(error)
    }

    clearTimers () {
        this.timers.forEach(timer => {
            clearTimeout(timer)
        })
        this.timers = []
    }


    push (...workers: any[]) {
        const methodResult = this.jobs.push(...workers);
        if (this.autostart) this._start();
        return methodResult
    }

    pop () {
        return this.jobs.pop()
    }

    shift () {
        return this.jobs.shift()
    }

    start(callback?) {
        if(this.running) throw new Error("이미 시작되었습니다.");
        let awaiter
        if(callback) {
            this._addCallbackToEndEvent(callback)
        } else {
            awaiter = this._createPromiseToEndEvent();
        }

        this._start()
        return awaiter
    }

    _createPromiseToEndEvent () {
        return new Promise((resolve, reject) => {
            this._addCallbackToEndEvent((error, results) => {
                if (error) reject(error)
                else resolve(results)
            })
        })
    }

    _addCallbackToEndEvent (cb) {
        const onend = evt => {
            this.removeEventListener('end', onend)
            cb(evt.detail.error, this.results)
        }
        this.addEventListener('end', onend)
    }

    _start () {
        this.running = true
        if (this.pending >= this.concurrency) {
            return
        }
        if (this.jobs.length === 0) {
            if (this.pending === 0) {
                this.done()
            }
            return
        }

        const job = this.jobs.shift();
        const session = this.session;

        // job과 job에 타임아웃 프로퍼티가 있으면 job의 타임아웃을 따라간다.
        const timeout = (job!==undefined && Object.prototype.hasOwnProperty.call(job, 'timeout') ? job.timeout : this.timeout)

        let once = true;
        let timeoutId: any = null;
        let didTimeout = false;
        let resultIndex: any = null;

        const next = (error?, ...result) => {
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
                    if(resultIndex !== null && this.results !== null) {
                        this.results[resultIndex] = [...result]
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
                didTimeout = true
                this.dispatchEvent(new QueueEvent('timeout', {next, job}))
                next();
            }, timeout);
            this.timers.push(timeoutId);
        }

        // results가 null이 아니면
        if(this.results !== null) {
            resultIndex = this.results.length;
            this.results[resultIndex] = null;
        }

        // pending 값을 추가하고 start 이벤트를 남긴다.
        this.pending++
        this.dispatchEvent(new QueueEvent('start', { job }));

        //
        job.promise = job(next);
        if(job.promise !== undefined && typeof job.promise.then === 'function') {
            job.promise.then(function (result) {
                return next(undefined, result);
            }).catch(function (err) {
                return next(err || true)
            })
        }

        if(this.running && this.jobs.length > 0) {
            this._start();
        }
    }

    done (error?: any) {
        this.session++
        this.running = false
        this.dispatchEvent(new QueueEvent('end', { error }))
    }

}

const queue = new AsyncEventQueue({autostart: false, concurrency: 2});

queue.push((cb) => {
    console.log('hello11');
    cb(undefined, 42)
})

queue.push((cb) => {
    console.log('hello222');
    cb(undefined, 22)
})

queue.push((cb) => {
    console.log("hello3333")
    cb(undefined, 33)
})
queue.push((cb) => {
    console.log("hello3333")
    cb(undefined, 33)
})
queue.push((cb) => {
    console.log("hello3333")
    cb(undefined, 33)
})
queue.push((cb) => {
    console.log("hello3333")
    cb(undefined, 33)
})
queue.push((cb) => {
    console.log("hello3333")
    cb(undefined, 33)
})

queue.start();