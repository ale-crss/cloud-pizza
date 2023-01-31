const awsUtil = require('../../../lambda-fns/utils/awsUtil');

describe.only('awsUtil tests', () => {

    it('should find the account id from a Lambda context', async () => {
        const context = {
            invokedFunctionArn: 'foo:bar:baz:wii:accountId:etc'
        };

        const accountId = awsUtil.getAwsAccountId(context);

        expect(accountId).toEqual('accountId');
    }); 
    
    it('should not find the account id from a Lambda context', async () => {
        const context = {
            invokedFunctionArn: 'foo:bar:baz:wii'
        };

        const accountId = awsUtil.getAwsAccountId(context);

        expect(accountId).toBeNull();
    });      
});