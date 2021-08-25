import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import {redis} from "../redis";
import consola from "consola";

import * as dotenv from "dotenv";

dotenv.config();

export const setCampaignsToRedis = async () => {

  try {
    let gunzip = zlib.createGunzip();
    let file = process.env.CAMPAIGNS_RECIPE_PATH || ''
    let stream = fs.createReadStream(file)
    let jsonStream = JSONStream.parse('*')
    stream.pipe(gunzip).pipe(jsonStream)
    consola.info(`Set campaigns to Local Redis`)
    jsonStream.on('data', async (item: any) => {
      if (!item.campaignId) {
        return
      }
      //consola.success(`Set campaigns to redis campaign_${item.campaignId}`)
      await redis.set(`campaign_${item.campaignId}`, JSON.stringify(item))
    })

  } catch (e) {
    consola.error('setCampaignsToRedisError:', e)
  }

}
