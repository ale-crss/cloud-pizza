/**
 * Convenient helper to implement time based functionality.
 */

/**
 * Delay function to simulate an async operation.
 * 
 * @param timeoutInMillis the amount of milliseconds the operation takes to be completed.
 * @param value the value that will resolve the returned promise.
 * @returns a promise.
 */
function delay(timeoutInMillis: number, value: string): Promise<string> {
    return new Promise(function(resolve) {
        setTimeout(resolve, timeoutInMillis, value);
    });
}

export {
    delay
};