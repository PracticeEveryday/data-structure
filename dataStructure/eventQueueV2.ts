export type queueDetailType = 'dayOneQueue';
export type EventName = 'enqueue' | 'dequeue';

class QueueEvent extends Event {
    public detail?: queueDetailType

    constructor (name: EventName, detail: queueDetailType) {
        super(name)
        this.detail = detail;
    }
}

class EventQueue extends EventTarget {
    public dayOneQueue: Function[] = [];
    public dayOneQueueFinisData : Function[] = [];
    public isProgress = false;

    constructor() {
        super();
    }

    public enqueue(name: queueDetailType, cb: Function) {
        this.dayOneQueue.push(cb);

        this.dispatchEvent(new QueueEvent('enqueue',  name));
    }

}

const eventQueue = new EventQueue();

eventQueue.addEventListener('enqueue', (event: QueueEvent) => {
    const queue = eventQueue[event.detail!];

    // 프로세스 진행중이면 기다려라 <- 사실 동기적으로 처리되니 의미가 없다.
    while (eventQueue.isProgress) {
        sleep(1000);
    }

    if(queue.length >= 5) {
        eventQueue.isProgress = true;
        // 5개가 들어오면 먼저함.
        for(let i = 0; i < 5; i++) {
            const poped = queue.pop();

            poped!();
            eventQueue.dayOneQueueFinisData.push(poped!);
        }
        eventQueue.isProgress  = false;
    } else {
        for(let i = 0; i < queue.length; i++) {
            const poped = queue.pop();

            poped!();
            eventQueue.dayOneQueueFinisData.push(poped!);
        }
    }
});

function sleep(ms: number) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

eventQueue.addEventListener('dequeue', () => {
    // event가 실행됩니다.
    // console.log('dequeue event');
});

eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));
eventQueue.enqueue('dayOneQueue', () => console.log("testsdfsdf"));


console.log(eventQueue.dayOneQueue);
console.log(eventQueue.dayOneQueueFinisData);