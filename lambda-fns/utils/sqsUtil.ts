/**
 * Convenient helper to manage SQS interactions.
 */
import { Context } from 'aws-lambda';
import * as AWS from "aws-sdk";
import { getAwsAccountId } from './awsUtil';

AWS.config.update({ region: process.env.AWS_REGION });

/**
 * Sends a message to an SQS queue.
 * 
 * @param message the message to be sent to the queue.
 */
async function queueMessage(message: string, queueUrl: string): Promise<void> {

    const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
         
    const params = {
        MessageBody: message,
        QueueUrl: queueUrl,
        MessageGroupId: 'notifications'
    };
          
    try {
        const data = await sqs.sendMessage(params).promise();
        console.log(`[sqsUtil] Successfully sent message to the queue [${queueUrl}]. Message: ${message}`);
    } catch(err) {
        console.error(`[sqsUtil] Failed to send message to the queue [${queueUrl}]. Error: `, err);
    }         
}

/**
 * Retrieves the notifications queue URL from the given Lambda context.
 * 
 * @param lambdaContext a Lambda context.
 * @returns the notifications queue URL.
 */
function getNotificationsQueueUrl(lambdaContext: Context): string {
    return `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${getAwsAccountId(lambdaContext)}/${process.env.ENV_VAR_NOTIFICATIONS_QUEUE}`;
}

/**
 * Prepares the body of a notification that will be sent.
 * 
 * @param phoneNumber the phone number of the notification recipient.
 * @param message the message to be sent to the recipient.
 * @returns a string that represents the body of the notification.
 */
function prepareNotificationBody(phoneNumber: string, message: string): string {
    const body = {
        phoneNumber,
        message
    };    
    return JSON.stringify(body);
}

export {
    queueMessage,
    getNotificationsQueueUrl,
    prepareNotificationBody
};
