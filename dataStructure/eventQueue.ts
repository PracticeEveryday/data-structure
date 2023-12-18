import { ValidateUtil } from "../utils/validate.util";

export class Node<T> {
    public value: T;
    public next: Node<T> | null;

    constructor(value: T) {
        this.value = value
        this.next = null;
    }
}

export class QueueEvent extends Event {
    public detail?: unknown
    constructor (name: string, detail: unknown) {
        super(name)
        this.detail = detail
    }
}

export class EventQueue<T> extends EventTarget {
    public first: Node<T> | null
    public last: Node<T> | null
    public size: number;

    constructor() {
        super();
        this.first = null;
        this.last = null;
        this.size = 0;
    }

    enqueue (val: T) {
        const newNode = new Node(val);
        if(!this.size) {
            // 없다면 최초의 노드의 주소를 담는다.
            this.first = newNode;
            this.last = newNode;
        } else {
            // 있다면 뒤에 삽입한다.
            if(ValidateUtil.isNotNull<Node<T>>(this.last)) {
                this.last.next = newNode;
                this.last = newNode;
            }
        }
        this.dispatchEvent(new QueueEvent('enqueue', { detail: val }));
        return ++this.size
    }

    dequeue() {
        if(!this.size) return null;

        let oldFirst
        if(ValidateUtil.isNotNull<Node<T>>(this.first)) {
            // 있으면 앞에것을 제거하기
            oldFirst = this.first;
            this.first = oldFirst.next;
            oldFirst.next = null;
        }
        this.size--;
        if(this.size === 0) {
            this.first = null;
            this.last = null;
        }

        this.dispatchEvent(new QueueEvent('dequeue', { detail: oldFirst }));
        return oldFirst;
    }
}

const eventQueue = new EventQueue();

eventQueue.addEventListener('enqueue', (_event: QueueEvent) => {
    // event가 실행됩니다.
    console.log('inqueue event')
    console.dir(_event)
});

eventQueue.addEventListener('dequeue', () => {
    // event가 실행됩니다.
    // console.log('dequeue event')
});

eventQueue.enqueue('Item 1');
eventQueue.enqueue('Item 2');
eventQueue.enqueue('Item 3');

console.log(eventQueue.dequeue());
console.log(eventQueue.dequeue());
console.log(eventQueue.dequeue());
