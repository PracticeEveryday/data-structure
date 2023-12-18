import {ValidateUtil} from "./validate.util";

describe('ValildateUtil 테스트', function () {
    it('isNotNull >> Null이라면 false, Null이 아니라면 true', function () {
        expect(ValidateUtil.isNotNull(null)).toBe(false);
        expect(ValidateUtil.isNotNull(1)).toBe(true);
        expect(ValidateUtil.isNotNull({})).toBe(true);
    });
});