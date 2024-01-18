import { EventName, queueDetailType } from "./eventQueueV2";

class AsyncQueueEvent extends Event {
    public detail?: queueDetailType

    constructor (name: EventName, detail: queueDetailType) {
        super(name)
        this.detail = detail;
    }
}

class AsyncEventQueue extends EventTarget {
    public dayOneQueue: any = [];
    public dayOneQueueFinisData :any = [];
    public isProgress = false;

    constructor() {
        super();
    }

    public enqueue<T>(name: queueDetailType, cb: (args: T) => Promise<T>) {
        this.dayOneQueue.push(cb);

        this.dispatchEvent(new AsyncQueueEvent('enqueue',  name));
    }
}

const asyncQueue = new AsyncEventQueue();

asyncQueue.addEventListener('enqueue', (_event: AsyncQueueEvent) => {
    // const queue = asyncQueue[event.detail!];
    console.log(_event);

});

function asyncTask<T>(value:T): Promise<T> {
    return new Promise((resolve) => {
        return resolve(value);
    })
}

asyncQueue.enqueue<number>('dayOneQueue', asyncTask<number>);
asyncQueue.dayOneQueue[0](12).then((value:number) => console.log(value));