// Implementation
namespace Reflect {
    export const hello = "hello";
    export function add(num1: number, num2: number): number {
        console.log(num1);
        console.log(num2);
        return num1 + num2;
    }
}
console.log(Reflect.add(1, 2))
console.log(Reflect.hello)