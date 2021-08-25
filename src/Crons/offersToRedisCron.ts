import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import {redis} from "../redis";
import consola from "consola";

import * as dotenv from "dotenv";

dotenv.config();

export const setOffersToRedis = async () => {

  try {
    let gunzip = zlib.createGunzip();
    let file = process.env.OFFERS_RECIPE_PATH || ''
    let stream = fs.createReadStream(file)
    let jsonStream = JSONStream.parse('*')
    stream.pipe(gunzip).pipe(jsonStream)
    consola.info(`Set offers to Local Redis`)
    jsonStream.on('data', async (item: any) => {
      if (!item.offerId) {
        return
      }
      // consola.info(`Set offers to redis offer_${item.offerId}`)
      await redis.set(`offer_${item.offerId}`, JSON.stringify(item))
    })

  } catch (e) {
    consola.error('setOffersToRedisError:', e)
  }

}
