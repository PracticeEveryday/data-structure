import { SingleLinkedList } from "./singleLinkedList";

describe('단일 연결 리스트 테스트', function () {
    test("하나의 노드만 있을 경우 head와 tail은 같다", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);

        expect(singleList.head?.value === singleList.tail?.value).toBe(true);
        expect(singleList.head?.value).toBe(1);
        expect(singleList.tail?.value).toBe(1);
        expect(singleList.length).toBe(1);
    })

    test("노드가 2개 이상일 때는 head와 tail이 각각 다르다", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);
        singleList.push(2);

        expect(singleList.head?.value).toBe(1);
        expect(singleList.tail?.value).toBe(2);
        expect(singleList.length).toBe(2);
    })
});