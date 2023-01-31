const twilioUtil = require('../../../lambda-fns/utils/twilioUtil');

describe.only('twilioUtil tests', () => {

    it('should "send" a message and return a message  id', async () => {        

        const result = await twilioUtil.sendSms('+17632736140', 'foo bar baz');

        const resultMillis = parseInt(result);

        expect(resultMillis).toBeLessThanOrEqual(Date.now());
    });   
});