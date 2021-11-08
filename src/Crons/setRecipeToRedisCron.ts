import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import {redis} from "../redis";
import consola from "consola";

import * as dotenv from "dotenv";
import os from "os"
import {influxdb} from "../Utils/metrics";
const computerName = os.hostname()
dotenv.config();

export const setOffersToRedis = async () => {

  try {
    let gunzip = zlib.createGunzip();
    let file = process.env.OFFERS_RECIPE_PATH || ''
    let stream = fs.createReadStream(file)
    let jsonStream = JSONStream.parse('*')
    stream.pipe(gunzip).pipe(jsonStream)
    const offersRedisKeys = await redis.keys(`offer_*`)
    for (const offerKey of offersRedisKeys) {
      await redis.del(offerKey)
    }
    consola.info(`Set offers to Local Redis computerName:${computerName}`)
    jsonStream.on('data', async (item: any) => {
      if (!item.offerId) {
        return
      }
      // consola.info(`Set offers to redis offer_${item.offerId}`)
      await redis.set(`offer_${item.offerId}`, JSON.stringify(item))
    })

  } catch (e) {
    influxdb(500, `set_offers_to_redis_error`)
    consola.error('setOffersToRedisError:', e)
  }

}

export const setCampaignsToRedis = async () => {

  try {
    let gunzip = zlib.createGunzip();
    let file = process.env.CAMPAIGNS_RECIPE_PATH || ''
    let stream = fs.createReadStream(file)
    let jsonStream = JSONStream.parse('*')
    stream.pipe(gunzip).pipe(jsonStream)
    consola.info(`Set campaigns to Local Redis computerName:${computerName}`)
    jsonStream.on('data', async (item: any) => {
      if (!item.campaignId) {
        return
      }
      //consola.success(`Set campaigns to redis campaign_${item.campaignId}`)
      await redis.set(`campaign_${item.campaignId}`, JSON.stringify(item))
    })

  } catch (e) {
    influxdb(500, `set_campaigns_to_redis_error`)
    consola.error('setCampaignsToRedisError:', e)
  }

}

