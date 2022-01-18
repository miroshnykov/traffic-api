import consola from 'consola';
import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { influxdb } from './metrics';
import { ISqsMessage } from '../Interfaces/sqsMessage';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS();

const queueUrl: string = process.env.AWS_SQS_QUEUE_URL || '';
consola.info(`queueUrl:${queueUrl}`);

export const sendMessageToQueue = (body: ISqsMessage): void => {
  const params = {
    MessageBody: JSON.stringify(body),
    MessageGroupId: 'co-traffic-group',
    QueueUrl: queueUrl,
  };

  consola.info('SendMessageToQueue PARAMS:', JSON.stringify(params));
  sqs.sendMessage(params).promise()
    .then((data) => data)
    .catch((err) => {
      influxdb(500, 'send_message_to_queue_error');
      consola.error('Error while send message to the sqs queue', err);
    });
};
