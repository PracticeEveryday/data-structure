import {ValidateUtil} from "../utils/validate.util";

export class Node<T> {
    public value: T;
    public next: Node<T> | null;

    constructor(value: T) {
        this.value = value
        this.next = null;
    }
}

export class Queue<T> {
    public first: Node<T> | null
    public last: Node<T> | null
    public size: number;

    constructor() {
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

        return oldFirst;
    }
}

