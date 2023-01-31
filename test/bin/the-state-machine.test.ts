import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import TheStateMachine = require('../../lib/the-state-machine-stack');

test('API Gateway Proxy Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::ApiGatewayV2::Integration", {
    "IntegrationType": "AWS_PROXY",
    "ConnectionType": "INTERNET",
    "IntegrationSubtype": "StepFunctions-StartSyncExecution",
    "PayloadFormatVersion": "1.0",
    "RequestParameters": {
        "Input": "$request.body",
        "StateMachineArn": {
        }
    },
    "TimeoutInMillis": 10000
  }
  ));
});


test('State Machine Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::StepFunctions::StateMachine", {
    "DefinitionString": {
      "Fn::Join": [
        "",
        [
          "{\"StartAt\":\"Order pizza job\",\"States\":{\"Order pizza job\":{\"Next\":\"With pineapple?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$\",\"ResultPath\":\"$\",\"Resource\":\"",
          {
            "Fn::GetAtt": [
              "orderPizzaLambdaHandler58F6696E",
              "Arn"
            ]
          },
          "\"},\"With pineapple?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.containsPineapple\",\"BooleanEquals\":true,\"Next\":\"Invalid pizza request\"}],\"Default\":\"Cook pizza job\"},\"Cook pizza job\":{\"Next\":\"Deliver pizza job\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$\",\"ResultPath\":\"$\",\"Resource\":\"",
          {
            "Fn::GetAtt": [
              "cookPizzaLambdaHandler1AFD5F5C",
              "Arn"
            ]
          },
          "\"},\"Deliver pizza job\":{\"Next\":\"Complete order job\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$\",\"ResultPath\":\"$\",\"Resource\":\"",
          {
            "Fn::GetAtt": [
              "deliverPizzaLambdaHandler15A6A3CC",
              "Arn"
            ]
          },
          "\"},\"Complete order job\":{\"Type\":\"Succeed\",\"OutputPath\":\"$\"},\"Invalid pizza request\":{\"Type\":\"Fail\",\"Error\":\"Failed to cook pizza\",\"Cause\":\"They asked for pineapple on their pizza (https://images.hindustantimes.com/rf/image_size_640x362/HT/p2/2017/04/06/Pictures/_d4a6088c-1abf-11e7-b8c3-4f9f853ee33e.jpg)\"}},\"TimeoutSeconds\":300}"
        ]
      ]
    },
    "StateMachineType": "EXPRESS",
    "TracingConfiguration": {
      "Enabled": true
    }
  }
  ));
});

test('Order Pizza Lambda Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
    "Handler": "orderPizza.handler"
  }
  ));
});

