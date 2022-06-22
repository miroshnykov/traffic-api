import consola from 'consola';
import { Redis } from 'ioredis';
import { redis } from '../redis';
import { influxdb } from '../Utils/metrics';
import { RedisHelper } from '../Utils/redisHelper';
// eslint-disable-next-line import/no-cycle
import { ICalcAggregatedOffer } from '../Services/offers/offersAggregated';

export enum IRedisStatuses {
  READY = 'ready',
  ERROR = 'error',
  CONNECTING = 'connecting',
}

let redisClient: any;
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  redisClient = RedisHelper.createClient(RedisHelper.readOptions()) as Redis;
} else {
  redisClient = redis;
}

redisClient.on(IRedisStatuses.READY, () => {
  consola.info('Connected to Redis Cluster server successfully');
});

redisClient.on(IRedisStatuses.ERROR, (err: any) => {
  consola.error('Redis cluster errors:', err);
  influxdb(500, 'redis_cluster_errors');
});

// export const getFp = async (key: string): Promise<string | null> => (redisClient.get(key));

// eslint-disable-next-line consistent-return
export const getFp = async (key: string): Promise<string | undefined> => {
  // consola.info('redisClientStatus:', redisClient.status);
  if (redisClient.status === IRedisStatuses.READY) {
    return redisClient.get(key);
  }
  consola.error(`getFp, redis server cluster not ready yet for some reason, status:${redisClient.status}`);
  influxdb(500, `redis_cluster_get_not_ready_status_${redisClient.status}`);
};

export const setFp = (key: string, value: string): void => {
  // 86400s ->  24h
  if (redisClient.status === IRedisStatuses.READY) {
    redisClient.set(key, value, 'EX', 86400).then().catch((e: any) => {
      influxdb(500, 'redis_cluster_set_value_error');
      consola.error('redis cluster set value error', e);
    });
  } else {
    consola.error(`setFp, redis server cluster not ready yet for some reason, status:${redisClient.status}`);
    influxdb(500, `redis_cluster_set_not_ready_status_${redisClient.status}`);
  }
};

export const delFp = (key: string): void => {
  redisClient.del(key).then().catch((e: any) => {
    consola.error('redis cluster del value error', e);
  });
};

export const expireFp = (key: string, seconds: number): void => {
  redisClient.expire(key, seconds).then().catch((e: any) => {
    influxdb(500, 'redis_cluster_expire_fp_value_error');
    consola.error('redis cluster expire Fp value error', e);
  });
};

export const setAggregatedOffersProportional = async (campaignId: number, arr: ICalcAggregatedOffer[]) => {
  if (redisClient.status === IRedisStatuses.READY) {
    const format = JSON.stringify(arr);
    await redisClient.set(`aggregatedOffersProportional:${campaignId}`, format);
  } else {
    consola.error(`setAggregatedOffersProportional, redis server cluster not ready yet for some reason, status:${redisClient.status}`);
    influxdb(500, `redis_cluster_set_not_ready_status_${redisClient.status}`);
  }
};

export const getAggregatedOffersProportional = async (campaignId: number) => {
  if (redisClient.status === IRedisStatuses.READY) {
    const response = await redisClient.get(`aggregatedOffersProportional:${campaignId}`);
    return response ? JSON.parse(response) : [];
  }
  consola.error(`getAggregatedOffersProportional, redis server cluster not ready yet for some reason, status:${redisClient.status}`);
  influxdb(500, `redis_cluster_set_not_ready_status_${redisClient.status}`);
  return null;
};

export const setAggOffersCountByCampaign = async (campaignId: number, count: number) => {
  await redisClient.set(`aggregatedOffersCount:${campaignId}`, count);
};

export const getAggOffersCountByCampaign = async (campaignId: number) => {
  const resp = await redisClient.get(`aggregatedOffersCount:${campaignId}`);
  return Number(resp);
};
