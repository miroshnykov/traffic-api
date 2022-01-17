import consola from 'consola';
import { Redis } from 'ioredis';
import { redis } from '../redis';
import { influxdb } from '../Utils/metrics';
import { RedisHelper } from '../Utils/redisHelper';

let redisClient: any;
if (process.env.NODE_ENV === 'production') {
  redisClient = RedisHelper.createClient(RedisHelper.readOptions()) as Redis;
} else {
  redisClient = redis;
}

export const getFp = async (key: string): Promise<string | null> => (redisClient.get(key));

export const setFp = (key: string, value: string): void => {
  // 86400s ->  24h
  redisClient.set(key, value, 'EX', 86400).then().catch((e: any) => {
    influxdb(500, 'redis_cluster_set_value_error');
    consola.error('redis cluster set value error', e);
  });
};

export const expireFp = (key: string, seconds: number): void => {
  redisClient.expire(key, seconds).then().catch((e: any) => {
    influxdb(500, 'redis_cluster_expire_fp_value_error');
    consola.error('redis cluster expire Fp value error', e);
  });
};
