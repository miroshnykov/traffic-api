import zlib from 'node:zlib';
import fs from 'node:fs';
import JSONStream from 'JSONStream';
import consola from 'consola';

import * as dotenv from 'dotenv';
import os from 'node:os';
import { redis } from '../redis';
import { influxdb } from '../Utils/metrics';
import { IOffer } from '../Interfaces/offers';

const computerName = os.hostname();
dotenv.config();

export const setOffersToRedis = async () => {
  try {
    const offersRedisKeys = await redis.keys('offer:*');
    consola.info(`offersRedisKeysForDeleteCount:${offersRedisKeys.length} computerName:${computerName}`);
    await Promise.all(offersRedisKeys.map(async (offerKey) => {
      await redis.del(offerKey);
    }));

    const gunzip = zlib.createGunzip();
    const file = process.env.OFFERS_RECIPE_PATH || '';
    const stream = fs.createReadStream(file);
    const jsonStream = JSONStream.parse('*');
    stream.pipe(gunzip).pipe(jsonStream);

    consola.info(`Set offers to Local Redis computerName:${computerName}`);
    jsonStream.on('data', async (item: IOffer) => {
      if (!item.offerId) {
        return;
      }
      // consola.info(`Set offers to redis offer:${item.offerId}`)
      await redis.set(`offer:${item.offerId}`, JSON.stringify(item));
    });
  } catch (e) {
    influxdb(500, 'set_offers_to_redis_error');
    consola.error('setOffersToRedisError:', e);
  }
};

export const setCampaignsToRedis = async () => {
  try {
    const campaignRedisKeys = await redis.keys('campaign:*');
    consola.info(`campaignKeysForDeleteCount:${campaignRedisKeys.length} computerName:${computerName}`);
    await Promise.all(campaignRedisKeys.map(async (campaignKey) => {
      await redis.del(campaignKey);
    }));

    const gunzip = zlib.createGunzip();
    const file = process.env.CAMPAIGNS_RECIPE_PATH || '';
    const stream = fs.createReadStream(file);
    const jsonStream = JSONStream.parse('*');
    stream.pipe(gunzip).pipe(jsonStream);
    consola.info(`Set campaigns to Local Redis computerName:${computerName}`);
    jsonStream.on('data', async (item: any) => {
      if (!item.campaignId) {
        return;
      }
      // consola.success(`Set campaigns to redis campaign:${item.campaignId}`)
      await redis.set(`campaign:${item.campaignId}`, JSON.stringify(item));
    });
  } catch (e) {
    influxdb(500, 'set_campaigns_to_redis_error');
    consola.error('setCampaignsToRedisError:', e);
  }
};
