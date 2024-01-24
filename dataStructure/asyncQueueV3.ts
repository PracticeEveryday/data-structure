interface QueueOptionInterface {
    autoStart?: boolean;
    isStopOnFailure?: boolean;
    startHandler?: any;
    successHandler?: any;
    failHandler?: any;
    concurrency?: number;
}
class QueueEvent extends Event {
    public detail?: { taskName?: string, task: Function, order: number, error? };

    constructor (name: string, detail?: { task: Function, order: number, error? }) {
        super(name);
        if(detail) {
            this.detail = detail;
            this.detail.taskName = this.detail?.task.name !== "" ? this.detail?.task.name : "익명 함수";
        }
    }
}
const createExecute = (asyncQueue: AsyncQueueV3, task: Function, order: number) => {
    return (error, ...result) => {
        const idx = order - 1;
        asyncQueue.successList[idx] = null;
        if (error) {
            // 에러시 error 이번트 발생 시키기
            asyncQueue.dispatchEvent(new QueueEvent('fail', {error, task, order}));
            return;
        }

        asyncQueue.successList[idx] = [...result];
    }
}
export class AsyncQueueV3 extends EventTarget {
    public totalCount: number;
    public concurrency: number = 0;
    public pending: number = 0;
    public taskArr: Function[] = [];


    public isRun: boolean = false;
    public autoStart: boolean = false;
    public isStopOnFailure: boolean = false;

    public successList: any[] = [];
    public failList: any[] = [];


    constructor(options: QueueOptionInterface) {
        super();
        this.totalCount = 0;

        if(options.autoStart) this.autoStart = options.autoStart;
        if(options.isStopOnFailure) this.isStopOnFailure = options.isStopOnFailure;

        options.startHandler && this.addEventListener("start", options.startHandler);
        options.successHandler && this.addEventListener("success", options.successHandler);
        options.failHandler? this.addEventListener("success", options.successHandler) : this.addEventListener("fail", this.failHandler);
    }

    private failHandler(event: QueueEvent) {
        this.failList.push(event.detail);
    }

    public push(...taskArr: Function[]) {
        this.taskArr.push(...taskArr);
        if(this.autoStart) this._start();
        this.totalCount++;

        return this.taskArr;
    }

    public start() {
        if(this.isRun) throw new Error("이미 시작되었습니다.");

        let awaiter = this.createPromiseToEndEvent();
        this._start();

        return awaiter;
    }

    private createPromiseToEndEvent() {
        return new Promise((resolve, reject) => {
            this.addCallbackToEndEvent((error, successResults) => {
                if (error) reject(error)
                else resolve(successResults)
            })
        })
    }

    private addCallbackToEndEvent(cb) {
        const onend = (event: QueueEvent) => {
            // end 이벤트 삭제
            this.removeEventListener('end', onend);
            if(this.isStopOnFailure){
                cb(event.detail?.error, this.successList);
            } else {
                cb(null, {success: this.successList, fail: this.failList});
            }
        }
        this.addEventListener('end', onend);
    }

    public _start() {
        // 할일이 없으면 암묵적 리턴
        if(!this.taskArr.length) return;

        // 시작한 횟수가 동시성 보다 많다면 암묵적 리턴
        if(this.pending > this.concurrency) return;

        this.isRun = true;
        this.pending++;

        const task = this.taskArr.shift()!;
        const order = this.totalCount - this.taskArr.length;
        this.dispatchEvent(new QueueEvent("start", { task, order }));
        const execute = createExecute(this, task, order);

        // task의 리턴 타입이 promise일 경우 비동기 처리
        const promise = task(execute);
        if(promise && typeof promise.then === "function") {
            promise.then((value) => execute(null, value)).catch((err) => execute(err || true));
        }

        // task가 끝나면 pending - 1;
        this.pending--;

        if(this.pending === 0 && this.taskArr.length === 0) {
            // end 메서드 호출
            this.isRun = false;
            this.dispatchEvent(new QueueEvent("end"));
        } else if(this.taskArr.length > 0) this._start();

        // 할 일이 남아 있다면 start 재귀 호출
    }
}

const queue = new AsyncQueueV3({concurrency: 1});





const result = queue.start();

result.then((value) => console.log(value)).catch((error) => console.log(error));