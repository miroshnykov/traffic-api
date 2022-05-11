import consola from 'consola';
// import os from 'os';
import { redis } from '../redis';
import { influxdb } from './metrics';
import { ISqsMessage } from '../Interfaces/sqsMessage';

// const computerName = os.hostname();

export const setSqsDataToRedis = async (message: ISqsMessage): Promise<void> => {
  // consola.info(`Getting from recipe-api update, Set to redis ${message.type}ID:${message.id}, action:${message.action}, comments:${message.comments}, Computer name { ${computerName} }`);
  try {
    if (message.action === 'updateOrCreate') {
      influxdb(200, 'local_redis_update_or_create');
      await redis.set(`${message.type}:${message.id}`, message.body);
    }
    if (message.action === 'delete') {
      influxdb(200, 'local_redis_delete');
      await redis.del(`${message.type}:${message.id}`);
    }
  } catch (e) {
    influxdb(500, 'sqs_processing_error');
    consola.error('sqsProcessingError');
  }
};
