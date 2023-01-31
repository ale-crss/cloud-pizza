// Type to model the pizza order request.
type OrderRequest = {
    flavour: string;
    deliveryAddress: string,
    customerName: string,
    customerPhoneNumber: string
};

// Type to model the pizza order.
type Order = {
    orderNumber: string,
    containsPineapple: boolean,
    deliveryAddress: string,
    customerName: string,
    customerPhoneNumber: string
};

type CustomerInfo = {
    orderNumber: string,
    customerName: string,
    deliveryAddress: string,
    customerPhoneNumber: string
};

type NotificationData = {
    phoneNumber: string,
    message: string
};

export {
    OrderRequest,
    Order,
    CustomerInfo,
    NotificationData
}