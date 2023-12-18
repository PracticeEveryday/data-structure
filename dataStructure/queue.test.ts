import {Queue} from "./queue";

describe('Queue 테스트', function () {
    test("하나의 노드만 있을 경우 first와 last은 같다", () => {
        const queue = new Queue<number>();
        queue.enqueue(1);

        expect(queue.first?.value === queue.last?.value).toBe(true);
        expect(queue.first?.value).toBe(1);
        expect(queue.last?.value).toBe(1);
        expect(queue.size).toBe(1);
    })

    test("노드가 2개 이상일 때는 first와 last이 각각 다르다", () => {
        const queue = new Queue<number>();
        queue.enqueue(1);
        queue.enqueue(2);

        expect(queue.first?.value).toBe(1);
        expect(queue.last?.value).toBe(2);
        expect(queue.size).toBe(2);
    })

    test("pop 테스트", () => {
        const queue = new Queue<number>();
        queue.enqueue(1);
        queue.enqueue(2);

        expect(queue.dequeue()?.value).toBe(1);
        expect(queue.dequeue()?.value).toBe(2);
        expect(queue.dequeue()).toBe(null);

    })
});