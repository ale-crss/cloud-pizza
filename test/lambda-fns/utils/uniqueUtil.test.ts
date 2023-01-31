const uniqueUtil = require('../../../lambda-fns/utils/uniqueUtil');

describe.only('uniqueUtil tests', () => {

    it('should generate a unique id', () => {        

        const result = uniqueUtil.generateUniqueId();

        const resultMillis = parseInt(result);

        expect(resultMillis).toBeLessThanOrEqual(Date.now());
    });   
});