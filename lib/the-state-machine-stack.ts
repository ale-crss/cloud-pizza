import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import sfn = require('@aws-cdk/aws-stepfunctions');
import tasks = require('@aws-cdk/aws-stepfunctions-tasks');
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Queue } from '@aws-cdk/aws-sqs';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as iam from '@aws-cdk/aws-iam';
import { Duration } from '@aws-cdk/core';

const ENV_VAR_NOTIFICATIONS_QUEUE: string = 'notifications.fifo';

export class TheStateMachineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Step Function Starts Here
     */
     
    // The first thing we need to do is to see if they are asking for pineapple on a pizza.
    let orderPizzaLambda = new lambda.Function(this, 'orderPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'orderPizza.handler',      
      timeout: Duration.seconds(5),
      environment: {
        ENV_VAR_NOTIFICATIONS_QUEUE
      }
    });

    // The second thing we need to do is to cook the pizza.
    let cookPizzaLambda = new lambda.Function(this, 'cookPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'cookPizza.handler',      
      timeout: Duration.seconds(5),
      environment: {
        ENV_VAR_NOTIFICATIONS_QUEUE
      }  
    });
    
    // The third thing we need to do is to deliver the pizza.
    let deliverPizzaLambda = new lambda.Function(this, 'deliverPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'deliverPizza.handler',      
      timeout: Duration.seconds(5),
      environment: {
        ENV_VAR_NOTIFICATIONS_QUEUE
      }
    });    

    // Step functions are built up of steps, we need to define our first step.
    const orderPizzaStep = new tasks.LambdaInvoke(this, "Order pizza job", {
      lambdaFunction: orderPizzaLambda,
      inputPath: '$',
      resultPath: '$',
      payloadResponseOnly: true
    });

    // Pizza order failure step defined.
    const ingredientFailureStep = new sfn.Fail(this, 'Invalid pizza request', {
      cause: 'They asked for pineapple on their pizza (https://images.hindustantimes.com/rf/image_size_640x362/HT/p2/2017/04/06/Pictures/_d4a6088c-1abf-11e7-b8c3-4f9f853ee33e.jpg)',
      error: 'Failed to cook pizza',
    });    

    // If they didn't ask for pineapple let's cook the pizza.
    const cookPizzaStep = new tasks.LambdaInvoke(this, "Cook pizza job", {
      lambdaFunction: cookPizzaLambda,
      inputPath: '$',
      resultPath: '$',
      payloadResponseOnly: true
    });  
    
    // Once the pizza has been cooked, let's deliver it.
    const deliverPizzaStep = new tasks.LambdaInvoke(this, "Deliver pizza job", {
      lambdaFunction: deliverPizzaLambda,
      inputPath: '$',
      resultPath: '$',
      payloadResponseOnly: true
    });  

    const completeOrderStep = new sfn.Succeed(this, 'Complete order job', {      
      outputPath: '$'
    });    

    // Logical choice added to flow
    const pineappleChoice = new sfn.Choice(this, 'With pineapple?') 
    // Look at the "containsPineapple" field. Fail if the pizza is meant to contain pineapple.
    .when(sfn.Condition.booleanEquals('$.containsPineapple', true), ingredientFailureStep)
    .otherwise(cookPizzaStep.next(deliverPizzaStep).next(completeOrderStep));

    // Express step function definition.
    const definition = sfn.Chain
    .start(orderPizzaStep)
    .next(pineappleChoice);

    let stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS
    });

    /**
     * SQS Definition
     */

    // Queue to support notifications delivery.
    const notificationsQueue = new Queue(this, 'NotificationsQueue', {
      fifo: true,
      queueName: ENV_VAR_NOTIFICATIONS_QUEUE,
      contentBasedDeduplication: true
    });           

    // Lambda function that performs the notification delivery.
    const sendNotificationLambda = new lambda.Function(this, 'sendNotificationLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'sendNotification.handler',      
    });        

    // Set the trigger of this function.
    sendNotificationLambda.addEventSource(new lambdaEventSources.SqsEventSource(notificationsQueue));          
    
    // Create a policy to access the queue.
    const notificationsQueueAccessPolicy = new iam.PolicyStatement();
    notificationsQueueAccessPolicy.addResources(notificationsQueue.queueArn);
    notificationsQueueAccessPolicy.addActions('sqs:SendMessage');
    
    // Set the permissions to allow these functions send data to the queue.
    orderPizzaLambda.addToRolePolicy(notificationsQueueAccessPolicy);
    cookPizzaLambda.addToRolePolicy(notificationsQueueAccessPolicy);
    deliverPizzaLambda.addToRolePolicy(notificationsQueueAccessPolicy);    

    /**
     * HTTP API Definition
     */
    // defines an API Gateway HTTP API resource backed by our step function


    // We need to give our HTTP API permission to invoke our step function
    const httpApiRole = new Role(this, 'HttpApiRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        AllowSFNExec: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['states:StartSyncExecution'],
              effect: Effect.ALLOW,
              resources: [stateMachine.stateMachineArn]
            })
          ]
        })
      }
    });

    const api = new apigw.HttpApi(this, 'the-state-machine-api', {
      createDefaultStage: true,
    });

    // create an AWS_PROXY integration between the HTTP API and our Step Function
    const integ = new apigw.CfnIntegration(this, 'Integ', {
      apiId: api.httpApiId,
      integrationType: 'AWS_PROXY',
      connectionType: 'INTERNET',
      integrationSubtype: 'StepFunctions-StartSyncExecution',
      credentialsArn: httpApiRole.roleArn,
      requestParameters: {
        Input: "$request.body",
        StateMachineArn: stateMachine.stateMachineArn
      },
      payloadFormatVersion: '1.0',
      timeoutInMillis: 10000,
    });

    new apigw.CfnRoute(this, 'DefaultRoute', {
      apiId: api.httpApiId,
      routeKey: apigw.HttpRouteKey.DEFAULT.key,
      target: `integrations/${integ.ref}`,
    });

    // output the URL of the HTTP API
    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy'
    });
  }
}
