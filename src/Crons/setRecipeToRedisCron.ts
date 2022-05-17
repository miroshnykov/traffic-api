import zlib from 'node:zlib';
import fs from 'node:fs';
import JSONStream from 'JSONStream';
import consola from 'consola';

import * as dotenv from 'dotenv';
import os from 'node:os';
import { redis } from '../redis';
import { influxdb } from '../Utils/metrics';
import { IOffer } from '../Interfaces/offers';
import { convertHrtime } from '../Utils/convertHrtime';

const computerName = os.hostname();
dotenv.config();

export const setOffersToRedis = async () => {
  try {
    const startTime: bigint = process.hrtime.bigint();

    const offersRedisKeys = await redis.keys('offer:*');
    consola.info(`offersRedisKeysForDeleteCount:${offersRedisKeys.length} computerName:${computerName}`);
    await Promise.all(offersRedisKeys.map(async (offerKey) => {
      await redis.del(offerKey);
    }));
    const file = process.env.OFFERS_RECIPE_PATH || '';
    const gunzip = zlib.createGunzip().on('error', (err) => {
      consola.error(`Zip file error ${file} `, err);
      influxdb(500, 'set_offers_to_redis_zip_error');
    });

    const stream = fs.createReadStream(file);
    const jsonStream = JSONStream.parse('*');
    stream.pipe(gunzip).pipe(jsonStream);

    stream.on('error', (err: any) => {
      consola.error(`Stream ReadFile ${file} err:`, err);
      influxdb(500, 'set_offers_to_redis_file_error');
    });

    consola.info(`Set offers to Local Redis computerName:${computerName}`);
    jsonStream.on('data', async (item: IOffer) => {
      if (!item.offerId) {
        return;
      }
      // consola.info(`Set offers to redis offer:${item.offerId}`)
      await redis.set(`offer:${item.offerId}`, JSON.stringify(item));
    });

    jsonStream.on('error', (err: any) => {
      consola.info('Offers recipe file got err', err);
      influxdb(500, 'set_offers_to_redis_error');
    });

    jsonStream.on('end', async () => {
      const endTime: bigint = process.hrtime.bigint();
      const diffTime: bigint = endTime - startTime;
      consola.info(`Finish set Offers time processing: { ${convertHrtime(diffTime)} } ms`);
      influxdb(200, `set_local_redis_offer_time_${convertHrtime(diffTime)}`);
    });
  } catch (e) {
    influxdb(500, 'set_offers_to_redis_error');
    consola.error('setOffersToRedisError:', e);
  }
};

export const setCampaignsToRedis = async () => {
  try {
    const startTime: bigint = process.hrtime.bigint();
    const campaignRedisKeys = await redis.keys('campaign:*');
    consola.info(`campaignKeysForDeleteCount:${campaignRedisKeys.length} computerName:${computerName}`);
    await Promise.all(campaignRedisKeys.map(async (campaignKey) => {
      await redis.del(campaignKey);
    }));

    const file = process.env.CAMPAIGNS_RECIPE_PATH || '';
    const gunzip = zlib.createGunzip().on('error', (err) => {
      consola.error(`Zip file for campaign error ${file} `, err);
      influxdb(500, 'set_campaigns_to_redis_zip_error');
    });

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
    jsonStream.on('end', async () => {
      const endTime: bigint = process.hrtime.bigint();
      const diffTime: bigint = endTime - startTime;
      consola.info(`Finish set Campaign time processing: { ${convertHrtime(diffTime)} } ms`);
      influxdb(200, `set_local_redis_campaign_time_${convertHrtime(diffTime)}`);
    });
    jsonStream.on('error', async () => {
      consola.info('Campaigns recipe file got err');
      influxdb(500, 'set_campaigns_to_redis_error');
    });
  } catch (e) {
    influxdb(500, 'set_campaigns_to_redis_error');
    consola.error('setCampaignsToRedisError:', e);
  }
};
