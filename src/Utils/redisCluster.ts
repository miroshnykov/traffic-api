import consola from "consola";
import {redis} from "../redis";
import {influxdb} from "./metrics";

export const getFpRedis = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key)
  } catch (e) {
    consola.info(`getFpRedisError:`, e)
    influxdb(500, 'redis_cluster_get_value_error')
    return null
  }
}

export const setFpToRedis = (key: string, value: string): void => {
  // 86400s ->  24h
  redis.set(key, value, 'EX', 86400).then().catch(e => {
    influxdb(500, 'redis_cluster_set_value_error')
    consola.error('redis cluster set value error', e)
  })
}