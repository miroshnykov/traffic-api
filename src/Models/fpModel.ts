import consola from "consola";
import {redis} from "../redis";
import {Redis} from 'ioredis';
import {influxdb} from "../Utils/metrics";
import {RedisHelper} from "../Utils/redisHelper"

let redisClient: any
if (process.env.NODE_ENV === 'production') {
  redisClient = RedisHelper.createClient(RedisHelper.readOptions()) as Redis;
} else {
  redisClient = redis
}

export const getFp = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key)
  } catch (e) {
    consola.info(`getFpRedisError:`, e)
    influxdb(500, 'redis_cluster_get_value_error')
    return null
  }
}

export const setFp = (key: string, value: string): void => {
  // 86400s ->  24h
  redisClient.set(key, value, 'EX', 86400).then().catch((e: any) => {
    influxdb(500, 'redis_cluster_set_value_error')
    consola.error('redis cluster set value error', e)
  })
}