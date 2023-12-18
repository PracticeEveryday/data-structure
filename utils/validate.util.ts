export class ValidateUtil {
    static isNotNull<T>(val: T | null): val is NonNullable<T> {
        return val !== null;
    }
}