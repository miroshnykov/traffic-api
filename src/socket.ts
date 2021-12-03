import {io} from "socket.io-client";
import consola from "consola";
import {redis} from "./redis";
import {getFileFromBucket} from "./Crons/getReceipS3Cron";
import {IRecipeType} from "./Interfaces/recipeTypes";
import {setCampaignsToRedis, setOffersToRedis} from "./Crons/setRecipeToRedisCron";
import {influxdb} from "./Utils/metrics";
import {setSqsDataToRedis} from "./Utils/cache";
import os from "os"
import {ISocketType} from "./Interfaces/socketTypes";
import {ISqsMessage} from "./Interfaces/sqsMessage";

const computerName = os.hostname()
let masterServerRunning: boolean = false
let slaveServerRunning: boolean = false

export const socketConnection = (type: ISocketType) => {

  let socketHost: string
  switch (type) {
    case ISocketType.MASTER:
      socketHost = process.env.SOCKET_HOST || ''
      break;
    case ISocketType.SLAVE:
      socketHost = process.env.SOCKET_HOST_SLAVE || ''
      break;
    default:
      socketHost = process.env.SOCKET_HOST || ''
  }

  const socket: any = []
  socket[type] = io(socketHost);
  socket[type].on('connect', () => {
    if (type === ISocketType.MASTER) {
      masterServerRunning = true
    }
    if (type === ISocketType.SLAVE) {
      slaveServerRunning = true
    }

    consola.info(`Socket connected, host: ${socketHost}, socket type: { ${type} }, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `)
  });

  socket[type].on('fileSizeOffersCheck', async (offersSizeRecipe: number) => {

    try {
      const offersSizeTraffic: number = Number(await redis.get(`offersSizeTraffic`))
      consola.warn(`Socket type: { ${type} }.Size of { offers } from recipe-api:${offersSizeRecipe} and from traffic-api:${offersSizeTraffic} is different, Re-download new recipe offers from S3, Set offersSizeTraffic to redis:${offersSizeRecipe}`)
      await redis.set(`offersSizeTraffic`, offersSizeRecipe)
      setTimeout(getFileFromBucket, 6000, IRecipeType.OFFER)
    } catch (e) {
      influxdb(500, `file_size_offers_check_error`)
      console.log(`fileSizeOffersInfoError:`, e)
    }
  })

  socket[type].on('fileSizeCampaignsCheck', async (campaignsSizeRecipe: number) => {

    try {
      const campaignsSizeTraffic: number = Number(await redis.get(`campaignsSizeTraffic`))
      consola.warn(`Socket type: { ${type} }.Size of { campaigns } from recipe-api:${campaignsSizeRecipe} and from co-traffic:${campaignsSizeTraffic} is different,  Re-download new recipe campaigns from S3, Set campaignsSizeTraffic to redis:${campaignsSizeRecipe} `)
      await redis.set(`campaignsSizeTraffic`, campaignsSizeRecipe!)
      setTimeout(getFileFromBucket, 6000, IRecipeType.CAMPAIGN)
      // setTimeout(setCampaignsToRedis, 20000)
    } catch (e) {
      influxdb(500, `file_size_campaigns_check_error`)
      console.log(`fileSizeCampaignsInfoError:`, e)
    }
  })

  socket[type].on('disconnect', () => {

    if (type === ISocketType.MASTER) {
      masterServerRunning = false
      influxdb(500, `disconnect_${type}`)
    }
    if (type === ISocketType.SLAVE) {
      slaveServerRunning = false
      influxdb(500, `disconnect_${type}`)
    }
    consola.warn(`Socket type: { ${type} } , server disconnect, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `);
  })


  const setOffersCheckSize: () => Promise<void> = async () => {
    try {
      if (type === ISocketType.MASTER && masterServerRunning) {
        await socketEmitOffersRun(type)
      } else if (type === ISocketType.SLAVE && !masterServerRunning && slaveServerRunning) {
        await socketEmitOffersRun(type)
      }
    } catch (e) {
      influxdb(500, `set_offers_check_size_error`)
      consola.error(`setOffersCheckSizeError:`, e)
    }
  }
  setInterval(setOffersCheckSize, 10000)

  const socketEmitOffersRun = async (type: ISocketType) => {
    // consola.info(`fileSizeOffersCheck, Socket type: { ${type} } masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `)
    const offerSize: number = Number(await redis.get(`offersSizeTraffic`))
    socket[type].emit('fileSizeOffersCheck', offerSize)
  }

  const setCampaignsCheckSize: () => Promise<void> = async () => {
    try {
      if (type === ISocketType.MASTER && masterServerRunning) {
        await socketEmitCampaignsRun(type)
      } else if (type === ISocketType.SLAVE && !masterServerRunning && slaveServerRunning) {
        await socketEmitCampaignsRun(type)
      }

    } catch (e) {
      influxdb(500, `set_campaigns_check_size_error`)
      consola.error(`setCampaignsCheckSizeError:`, e)
    }
  }
  const socketEmitCampaignsRun = async (type: ISocketType) => {
    // consola.info(`fileSizeCampaignsCheck, Socket type: { ${type} }, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `)
    const campaignsSize: number = Number(await redis.get(`campaignsSizeTraffic`))
    socket[type].emit('fileSizeCampaignsCheck', campaignsSize)
  }

  setInterval(setCampaignsCheckSize, 10000)

  if (ISocketType.MASTER === type) {
    // consola.warn(`ISocketType:${type}`)
    socket[type].on('updRecipe', async (message: ISqsMessage) => {
      await setSqsDataToRedis(message)
    })

    const checkRedisSize = async () => {
      let redisSize: number = await redis.dbsize()
      influxdb(200, `redis_size_${redisSize}_for_${computerName}`)
    }
    setInterval(checkRedisSize, 600000) // 600000 every 10 min

    const checkRedisSizeOffers = async () => {
      const offersRedisKeys = await redis.keys(`offer_*`)
      influxdb(200, `redis_size_offers_${offersRedisKeys.length}_for_${computerName}`)
    }
    setInterval(checkRedisSizeOffers, 720000) // 720000 every 12 min
  }
}