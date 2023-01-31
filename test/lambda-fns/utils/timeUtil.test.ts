const timeUtil = require('../../../lambda-fns/utils/timeUtil');

describe.only('timeUtil tests', () => {

    it('should resolve the delay with the given value', async () => {
        const value = 'foo';

        const result = await timeUtil.delay(500, value);

        expect(result).toEqual(value);
    });   
});