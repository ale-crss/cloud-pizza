/**
 * Convenient helper to simulate Twilio's capability of sending messages.
 */
import { generateUniqueId } from "./uniqueUtil";
import { delay } from "./timeUtil";

/**
 * Placeholder method to simulate the ability to send a message.
 * 
 * @param phoneNumber the target phone number.
 * @param message the content of the SMS.
 * @return a promise that resolves with the unique identifier of the SMS.
 */
async function sendSms(phoneNumber: string, message: string): Promise<string> {
    console.log(`[twilioUtil] Sending SMS to phone number ${phoneNumber}. Message: ${message}`);
    const messageId: string = generateUniqueId();
    await delay(500, message);
    console.log(`[twilioUtil] Successfully SMS to phone number ${phoneNumber}. Message id: ${messageId}`);
    return Promise.resolve(messageId);
}

export {
    sendSms
};
