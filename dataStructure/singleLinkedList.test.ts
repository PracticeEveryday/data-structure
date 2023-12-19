import { SingleLinkedList } from "./singleLinkedList";

describe('단일 연결 리스트 push Method',  () => {
    test("하나의 노드만 있을 경우 head와 tail은 같다", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);

        expect(singleList.head?.value === singleList.tail?.value).toBe(true);
        expect(singleList.head?.value).toBe(1);
        expect(singleList.tail?.value).toBe(1);
        expect(singleList.tail?.next).toBe(null);
        expect(singleList.length).toBe(1);
    });

    test("노드가 2개 이상일 때는 head와 tail이 각각 다르다", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);
        singleList.push(2);

        expect(singleList.head?.value).toBe(1);
        expect(singleList.tail?.value).toBe(2);
        expect(singleList.tail?.next).toBe(null);
        expect(singleList.head === singleList.tail).toBe(false);
        expect(singleList.length).toBe(2);
    });
});

describe('단인 연결 리스트 pop Method', () => {
    test('노드가 없을 때는 null을 반환한다.', () => {
        const singleList = new SingleLinkedList<number>();

        expect(singleList.pop()).toBe(null);
    })

    test('제일 마지막 노드를 반환한다.', () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);
        singleList.push(2);

        expect(singleList.pop()?.value).toBe(2);
        expect(singleList.length).toBe(1);
    })
});

describe('단인 연결 리스트 shift Method', () => {
    test('노드가 없을 때는 null을 반환한다.', () => {
        const singleList = new SingleLinkedList<number>();

        expect(singleList.shift()).toBe(null);
    })

    test('제일 첫 노드를 반환한다.', () => {
        const singleList = new SingleLinkedList<number>();
        singleList.push(1);
        singleList.push(2);

        expect(singleList.shift()?.value).toBe(1);
        expect(singleList.length).toBe(1);        
    })
});


describe('단인 연결 리스트 unshift Method', function () {
    test("최초로 노드가 생성될 경우 head와 tail은 동일한 노드를 바라본다.", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.unshift(1);

        expect(singleList.head?.value).toBe(1);
        expect(singleList.tail?.value).toBe(1);
        expect(singleList.head === singleList.tail).toBe(true);
        expect(singleList.length).toBe(1);
    })

    test("unshift는 노드의 제일 앞 부분에 삽입된다.", () => {
        const singleList = new SingleLinkedList<number>();
        singleList.unshift(1);
        singleList.unshift(2);

        expect(singleList.head?.value).toBe(2);
        expect(singleList.head?.next?.value).toBe(1);
        expect(singleList.tail?.value).toBe(1);
        expect(singleList.tail?.next).toBe(null);
        expect(singleList.length).toBe(2);

    })
});

describe('단인 연결 리스트 get Method', function () {
    const singleList = new SingleLinkedList<number>();
    singleList.push(1);
    singleList.push(2);
    singleList.push(3);
    singleList.push(4);

    expect(singleList.get(-1)).toBe(null);
    expect(singleList.get(0)?.value).toBe(1);
    expect(singleList.get(1)?.value).toBe(2);
    expect(singleList.get(2)?.value).toBe(3);
    expect(singleList.get(3)?.value).toBe(4);
    expect(singleList.get(5)).toBe(null);
});


describe('단인 연결 리스트 set Method', function () {
    const singleList = new SingleLinkedList<number>();
    singleList.push(1);
    singleList.push(2);
    singleList.push(3);
    singleList.push(4);

    expect(singleList.set(-1, 10)).toBe(null);
    expect(singleList.set(1, 10)).toBe(10);
    expect(singleList.get(1)?.value).toBe(10);
    expect(singleList.set(2, 11)).toBe(11);
    expect(singleList.get(2)?.value).toBe(11);
    expect(singleList.set(3, 100)).toBe(100);
    expect(singleList.get(3)?.value).toBe(100);

    expect(singleList.length).toBe(4);
    expect(singleList.head?.value).toBe(1);
    expect(singleList.tail?.value).toBe(100);

    // 길이보다 길면 null 반환
    expect(singleList.set(4, 200)).toBe(null);
    expect(singleList.get(4)).toBe(null);
    expect(singleList.set(5, 10)).toBe(null);


});


describe('단일 연결 리스트 search Method', function () {
    const singleList = new SingleLinkedList<number>();


    expect(singleList.insert(-1, 100)).toBe(null);
    expect(singleList.insert(0, 1)?.value).toBe(1);
    expect(singleList.insert(1, 2)?.value).toBe(2);
    expect(singleList.insert(2, 3)?.value).toBe(3);
    expect(singleList.insert(3, 4)?.value).toBe(4);
    expect(singleList.insert(5, 6)).toBe(null);
    expect(singleList.insert(7, 100)).toBe(null);

    expect(singleList.length).toBe(4)

});