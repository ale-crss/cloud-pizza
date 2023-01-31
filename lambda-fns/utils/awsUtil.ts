/**
 * Convenient helper to manage AWS functions.
 */

import { Context } from 'aws-lambda';

/**
 * Returns the 12 digit account id from the given Lambda context.
 * 
 * @param lambdaContext the lambda context to extract the account id from.
 * @returns the 12 digit account id as a string or null if the value is not available.
 */
function getAwsAccountId(lambdaContext: Context): string | null {
    const splitArray = lambdaContext.invokedFunctionArn.split(':');
    if (splitArray.length >= 5) {
        return splitArray[4];       
    }
    return null;
}

export {
    getAwsAccountId
};
