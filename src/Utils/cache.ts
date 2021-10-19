import consola from "consola";
import {redis} from "../redis";
import {influxdb} from "./metrics";
import {ISqsMessage} from "../Interfaces/sqsMessage";

export const setSqsDataToRedis = async (message: ISqsMessage) => {

  try {
    if (message.action === 'updateOrCreate') {
      await redis.set(`${message.type}_${message.id}`, message.body)

    }
    if (message.action === 'delete') {
      await redis.del(`${message.type}_${message.id}`)
    }
  } catch (e) {
    influxdb(500, 'sqs_processing_error')
    consola.error('sqsProcessingError')
  }
}