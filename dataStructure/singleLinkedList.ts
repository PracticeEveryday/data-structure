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

    public push(val: T): Node<T> | null {
        const newNode = new Node(val);
        if(!(this.tail && this.head)) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.length++
        return newNode;
    }

    public pop(): Node<T> | null {
        if(!(this.tail && this.head)) return null;

        let current = this.head;
        let newTail = current;

        while (current.next) {
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

    public shift(): Node<T> | null {
        if(!(this.tail && this.head)) return null;

        const oldFirst = this.head;
        this.head = this.head.next;
        oldFirst.next = null;

        this.length--;

        return oldFirst
    }

    public unshift(val: T): Node<T> | null {
        const newNode = new Node(val)
        if(!(this.tail && this.head)) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode
        }

        this.length++;
        return newNode;
    }

    public get(idx: number): Node<T> | null {
        if(idx < 0) return null;
        if(idx >= this.length) return null;
        if(!(this.tail && this.head)) return null;

        let current = this.head;
        for (let i = 0 ; i < idx ; i++) {
            if(current.next) current = current.next;
        }
        return current;
    }

    public set(idx: number, val: T) {
        if(idx < 0) return null;
        if(idx > this.length) return null;

        const current = this.get(idx);
        if(!current) return null;
        current.value = val;

        return current.value;
    }

    public insert(idx: number, val: T) {
        if(idx < 0) return null;
        if(idx > this.length) return null;

        const newNode = new Node(val);
        if(!(this.tail && this.head)) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            let current = this.head;
            for (let i = 0 ; i < idx ; i++) {
                if(current.next) current = current.next;
            }

            if(idx === this.length) {
                this.tail = newNode;
            }
            newNode.next = current.next;
            current.next = newNode;
        }

        this.length++;
        return newNode;
    }
};