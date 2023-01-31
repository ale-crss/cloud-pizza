import * as AWS from 'aws-sdk';
const orderPizzaLambda = require('../../lambda-fns/orderPizza');

jest.mock('aws-sdk', () => {
    const SQSMock = {
        sendMessage: jest.fn().mockReturnThis(),
        promise: jest.fn().mockResolvedValue({
            MessageId: '1234567890'
        })
    };
    return {
        SQS: jest.fn(() => SQSMock),
        config: {
            update() {
                return {};
            }
        }
    };
});
  
const sqs = new AWS.SQS({
    region: 'us-west-2'
});

describe.only('orderPizza tests', () => {

    const CUSTOMER_NAME: string = 'John';
    const CUSTOMER_PHONE_NUMBER: string = '+17632736140';
    const DELIVERY_ADDRESS: string = '110 N Sunset Blvd, Caledonia, MN 55921';

    beforeEach(() => {
        (sqs.sendMessage().promise as jest.MockedFunction<any>).mockReset();
    });

    it('should detect when the flavor is not pineapple or hawaiian', async () => {
        const event = {            
            flavour: 'pepperoni',
            customerName: CUSTOMER_NAME,
            customerPhoneNumber: CUSTOMER_PHONE_NUMBER,
            deliveryAddress: DELIVERY_ADDRESS                
        };

        const context = {
            invokedFunctionArn: 'foo:bar:baz:wii:accountId:etc'
        };

        const response = await orderPizzaLambda.handler(event, context);        

        expect(response.containsPineapple).toBeFalsy();
        expect(response.customerName).toEqual(CUSTOMER_NAME);
        expect(response.customerPhoneNumber).toEqual(CUSTOMER_PHONE_NUMBER);
        expect(response.deliveryAddress).toEqual(DELIVERY_ADDRESS);
        expect(response.orderNumber).toBeDefined();
    });

    it('should detect when the flavor is pineapple', async () => {
        const event = {            
            flavour: 'pineapple',
            customerName: CUSTOMER_NAME,
            customerPhoneNumber: CUSTOMER_PHONE_NUMBER,
            deliveryAddress: DELIVERY_ADDRESS                
        };

        const context = {
            invokedFunctionArn: 'foo:bar:baz:wii:accountId:etc'
        };

        const response = await orderPizzaLambda.handler(event, context);        

        expect(response.containsPineapple).toBeTruthy();
        expect(response.customerName).toEqual(CUSTOMER_NAME);
        expect(response.customerPhoneNumber).toEqual(CUSTOMER_PHONE_NUMBER);
        expect(response.deliveryAddress).toEqual(DELIVERY_ADDRESS);
        expect(response.orderNumber).toBeDefined();
    });   
    
    it('should detect when the flavor is hawaiian', async () => {
        const event = {            
            flavour: 'hawaiian',            
            customerPhoneNumber: CUSTOMER_PHONE_NUMBER,
            deliveryAddress: DELIVERY_ADDRESS                
        };

        const context = {
            invokedFunctionArn: 'foo:bar:baz:wii:accountId:etc'
        };

        const response = await orderPizzaLambda.handler(event, context);        

        expect(response.containsPineapple).toBeTruthy();
        expect(response.customerName).toEqual('Dear customer');
        expect(response.customerPhoneNumber).toEqual(CUSTOMER_PHONE_NUMBER);
        expect(response.deliveryAddress).toEqual(DELIVERY_ADDRESS);
        expect(response.orderNumber).toBeDefined();
    });        
});