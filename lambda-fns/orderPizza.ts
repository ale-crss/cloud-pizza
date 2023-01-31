import { Context } from 'aws-lambda';
import { OrderRequest } from "../types/types";
import { queueMessage, prepareNotificationBody } from "./utils/sqsUtil";
import { generateUniqueId } from "./utils/uniqueUtil";
import { getNotificationsQueueUrl } from './utils/sqsUtil';

exports.handler = async function(orderRequest: OrderRequest, context: Context) {
    console.log("[orderPizza] Order info: ", JSON.stringify(orderRequest, undefined, 2));    
    
    let {flavour, deliveryAddress, customerName, customerPhoneNumber}: OrderRequest = orderRequest;
    customerName = customerName || 'Dear customer';
    const containsPineapple = (flavour === 'pineapple' || flavour === 'hawaiian');        
    const orderNumber = generateUniqueId();
    let notificationBody: string;

    // Send a notification if a phone number was provided.
    if (customerPhoneNumber) {
        if (containsPineapple) {
            // Let the customer know the order won't be processed.
            notificationBody = prepareNotificationBody(customerPhoneNumber, `${customerName}, thanks for ordering Cloud Pizza. Unfortunately, we do not add pineapple to our pizzas so we cannot fulfill your order.`);                
        } else {
            // Let the customer know the order was received successfully.        
            notificationBody = prepareNotificationBody(customerPhoneNumber, `${customerName}, thanks for ordering Cloud Pizza. Your order number is ${orderNumber}.`);                
        }
        await queueMessage(notificationBody, getNotificationsQueueUrl(context));
    }    
    
    return {
        'orderNumber': orderNumber,
        'containsPineapple': containsPineapple, 
        'deliveryAddress': deliveryAddress, 
        'customerName': customerName,
        'customerPhoneNumber': customerPhoneNumber
    }
}