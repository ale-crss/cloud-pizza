import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { NotificationData } from "../types/types";
import { sendSms } from "./utils/twilioUtil";

exports.handler = async function(event: SQSEvent, context: Context) {
    console.log("[sendNotification] Sending notification based on the following data: ", JSON.stringify(event, undefined, 2));
    
    const record: SQSRecord = event.Records[0];
    const notificationData: NotificationData = JSON.parse(record.body);

    // Simulate the Twilio behavior.
    await sendSms(notificationData.phoneNumber, notificationData.message);        
}