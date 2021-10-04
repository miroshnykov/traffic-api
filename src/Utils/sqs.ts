import consola from "consola";

import AWS from 'aws-sdk'
import * as dotenv from "dotenv";
dotenv.config();
import {influxdb} from "./metrics";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

let sqs = new AWS.SQS()

const queueUrl: string = process.env.AWS_SQS_QUEUE_URL || ''
consola.info(`queueUrl:${queueUrl}`)

export const sendMessageToQueue = async (body: any) => {

  let params = {
    MessageBody: JSON.stringify(body),
    MessageGroupId: 'sfl-engine-group',
    QueueUrl: queueUrl,
  };

  consola.info('SendMessageToQueue PARAMS:', JSON.stringify(params))
  return sqs.sendMessage(params).promise()
    .then(data => {
      return data
    })
    .catch(err => {
      influxdb(500,'send_message_to_queue_error')
      console.error('Error while send message to the sqs queue', err)
    })
}
