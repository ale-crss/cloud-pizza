import { Context } from 'aws-lambda';
import { Order } from "../types/types";
import { queueMessage, prepareNotificationBody } from "./utils/sqsUtil";
import { delay } from "./utils/timeUtil";
import { getNotificationsQueueUrl } from './utils/sqsUtil';

exports.handler = async function(order: Order, context: Context) {
    console.log("[cookPizza] Cooking pizza from the following order: ", JSON.stringify(order, undefined, 2));
    
    const {orderNumber, containsPineapple, deliveryAddress, customerName, customerPhoneNumber}: Order = order;    

    // Send a notification if a phone number was provided.
    if (customerPhoneNumber) {
        const notificationBody: string = prepareNotificationBody(customerPhoneNumber, `${customerName}, your order ${orderNumber} is being prepared.`);        
    
        // Let the user know the order is being prepared.
        await queueMessage(notificationBody, getNotificationsQueueUrl(context));
    }

    // Simulate the preparation process with a delay.
    await delay(2000, '');    

    return {
        'orderNumber': orderNumber,
        'customerName': customerName,
        'deliveryAddress': deliveryAddress,
        'customerPhoneNumber': customerPhoneNumber
    };
}