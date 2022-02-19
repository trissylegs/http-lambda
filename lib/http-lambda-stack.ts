import { DockerImage, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export class HttpLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const target = 'x86_64-unknown-linux-musl';
    const hello = new Function(this, 'HelloHandler', {
      code: Code.fromAsset('lambda/hello', {
        bundling: {
          command: [
            'bash', '-c',
            `rustup target add ${target} && ` + 
            `cargo build --release --target ${target} && ` + 
            `cp target/${target}/release/hello /asset-output/bootstrap`            
          ],
          image: DockerImage.fromRegistry('rust:1.57-slim')
        }
      }),
      functionName: 'hello',
      handler: 'main',
      runtime: Runtime.PROVIDED_AL2
    })
    const gw = new LambdaRestApi(this, 'HelloEndpoint', {
      handler: hello
    });
  }
}
