import { ValidateUtil } from "../utils/validate.util";

export class Node<T> {
    public  value: T;
    public next: Node<T> | null;

    constructor(value: T) {
        this.value = value
        this.next = null;
    }
}

export class SingleLinkedList<T> {
    public head: Node<T> | null
    public tail: Node<T> | null
    public length: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    public push(val: T) {
        const newNode = new Node(val);
        if(!this.length) {
            this.head = newNode;
            this.tail = newNode;
        }

        if(ValidateUtil.isNotNull<Node<T>>(this.tail)){
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.length++
        return newNode;
    }

    public pop() {
        if(!(this.tail && this.head)) return null;

        let current = this.head;
        let newTail = current;

        while (current.next) {
            console.log(current);
            newTail = current;
            current = current.next;
        }

        this.tail = newTail;
        this.tail.next = null;

        this.length--;

        if(this.length === 0) {
            this.head = null;
            this.tail = null;
        }
        return current;
    }

    public shift() {
        if(!(this.tail && this.head)) return null;

        const oldFirst = this.head;
        this.head = this.head.next;
        oldFirst.next = null;

        this.length--;

        return oldFirst
    }
};