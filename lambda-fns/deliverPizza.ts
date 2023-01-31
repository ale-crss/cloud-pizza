import { Context } from 'aws-lambda';
import { CustomerInfo } from "../types/types";
import { queueMessage, prepareNotificationBody } from "./utils/sqsUtil";
import { delay } from "./utils/timeUtil";
import { getNotificationsQueueUrl } from './utils/sqsUtil';

exports.handler = async function(customerInfo: CustomerInfo, context: Context) {
    console.log("[deliverPizza] Deliverying pizza from the following customer info: ", JSON.stringify(customerInfo, undefined, 2));
    
    const {orderNumber, deliveryAddress, customerName, customerPhoneNumber}: CustomerInfo = customerInfo;    

    // Send a notification if a phone number was provided.
    if (customerPhoneNumber) {
        let body: string = `${customerName}, your order ${orderNumber} is ready to be delivered`;
        if (deliveryAddress) {
            body += `  at ${deliveryAddress}.`;
        } else {
            body += '.';
        }
        const notificationBody: string = prepareNotificationBody(customerPhoneNumber, body);        

        // Let the user know the order is being prepared.
        await queueMessage(notificationBody, getNotificationsQueueUrl(context));
    }

    // Simulate the delivery process with a delay.
    await delay(1000, ''); 

    return customerInfo;
}