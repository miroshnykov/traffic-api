import { io } from 'socket.io-client';
import consola from 'consola';
import os from 'os';
import { redis } from './redis';
import { getFileFromBucket } from './Crons/getReceipS3Cron';
import { IRecipeType } from './Interfaces/recipeTypes';
// import { setCampaignsToRedis, setOffersToRedis } from './Crons/setRecipeToRedisCron';
import { influxdb } from './Utils/metrics';
import { setSqsDataToRedis } from './Utils/cache';
import { ISocketType } from './Interfaces/socketTypes';
import { ISqsMessage } from './Interfaces/sqsMessage';
import { IntervalTime } from './Constants/intervalTime';

const computerName = os.hostname();
let masterServerRunning: boolean = false;
let slaveServerRunning: boolean = false;

export const socketConnection = (type: ISocketType) => {
  let socketHost: string;
  switch (type) {
    case ISocketType.MASTER:
      socketHost = process.env.SOCKET_HOST || '';
      break;
    case ISocketType.SLAVE:
      socketHost = process.env.SOCKET_HOST_SLAVE || '';
      break;
    default:
      socketHost = process.env.SOCKET_HOST || '';
  }

  const socket: any = [];
  socket[type] = io(socketHost);
  socket[type].on('connect', () => {
    if (type === ISocketType.MASTER) {
      masterServerRunning = true;
    }
    if (type === ISocketType.SLAVE) {
      slaveServerRunning = true;
    }

    consola.info(`Socket connected, host: ${socketHost}, socket type: { ${type} }, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `);
  });

  socket[type].on('fileSizeOffersCheck', async (offersSizeRecipe: number) => {
    try {
      const offersSizeTraffic: number = Number(await redis.get('offersSizeTraffic'));
      consola.warn(`Socket type: { ${type} }.Size of { offers } from recipe-api:${offersSizeRecipe} and from traffic-api:${offersSizeTraffic} is different, Re-download new recipe offers from S3, Set offersSizeTraffic to redis:${offersSizeRecipe}`);
      await redis.set('offersSizeTraffic', offersSizeRecipe);
      setTimeout(getFileFromBucket, 6000, IRecipeType.OFFER);
    } catch (e) {
      influxdb(500, `file_size_offers_check_error_${type}`);
      consola.error(`fileSizeOffersInfoError${type}:`, e);
    }
  });

  socket[type].on('fileSizeCampaignsCheck', async (campaignsSizeRecipe: number) => {
    try {
      const campaignsSizeTraffic: number = Number(await redis.get('campaignsSizeTraffic'));
      consola.warn(`Socket type: { ${type} }.Size of { campaigns } from recipe-api:${campaignsSizeRecipe} and from co-traffic:${campaignsSizeTraffic} is different,  Re-download new recipe campaigns from S3, Set campaignsSizeTraffic to redis:${campaignsSizeRecipe} `);
      await redis.set('campaignsSizeTraffic', campaignsSizeRecipe!);
      setTimeout(getFileFromBucket, 6000, IRecipeType.CAMPAIGN);
      // setTimeout(setCampaignsToRedis, 20000)
    } catch (e) {
      influxdb(500, `file_size_campaigns_check_error_${type}`);
      consola.error(`fileSizeCampaignsInfoError${type}:`, e);
    }
  });

  socket[type].on('disconnect', () => {
    if (type === ISocketType.MASTER) {
      masterServerRunning = false;
      influxdb(500, `disconnect_${type}`);
    }
    if (type === ISocketType.SLAVE) {
      slaveServerRunning = false;
      influxdb(500, `disconnect_${type}`);
    }
    consola.warn(`Socket type: { ${type} } , server disconnect, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `);
  });

  const setOffersCheckSize: () => Promise<void> = async () => {
    try {
      if (type === ISocketType.MASTER && masterServerRunning) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await socketEmitOffersRun();
      } else if (type === ISocketType.SLAVE && !masterServerRunning && slaveServerRunning) {
        influxdb(500, 'master_recipe_api_off_use_slave');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await socketEmitOffersRun();
      }
    } catch (e) {
      influxdb(500, `set_offers_check_size_error_${type}`);
      consola.error(`setOffersCheckSizeError${type}:`, e);
    }
  };
  setInterval(setOffersCheckSize, IntervalTime.OFFERS_CHECK_SIZE);

  const socketEmitOffersRun = async () => {
    // consola.info(`fileSizeOffersCheck, Socket type: { ${type} } masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `)
    const offerSize: number = Number(await redis.get('offersSizeTraffic'));
    socket[type].emit('fileSizeOffersCheck', offerSize);
  };

  const setCampaignsCheckSize: () => Promise<void> = async () => {
    try {
      if (type === ISocketType.MASTER && masterServerRunning) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await socketEmitCampaignsRun();
      } else if (type === ISocketType.SLAVE && !masterServerRunning && slaveServerRunning) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await socketEmitCampaignsRun();
      }
    } catch (e) {
      influxdb(500, `set_campaigns_check_size_error_${type}`);
      consola.error(`setCampaignsCheckSizeError${type}:`, e);
    }
  };
  const socketEmitCampaignsRun = async () => {
    // consola.info(`fileSizeCampaignsCheck, Socket type: { ${type} }, masterServerRunning:${masterServerRunning}, slaveServerRunning:${slaveServerRunning} `)
    const campaignsSize: number = Number(await redis.get('campaignsSizeTraffic'));
    socket[type].emit('fileSizeCampaignsCheck', campaignsSize);
  };

  setInterval(setCampaignsCheckSize, IntervalTime.CAMPAIGN_CHECK_SIZE);

  if (ISocketType.MASTER === type) {
    // consola.warn(`ISocketType:${type}`)
    socket[type].on('updRecipe', async (message: ISqsMessage) => {
      await setSqsDataToRedis(message);
    });

    const checkRedisSizeCampaigns = async () => {
      const campaignRedisKeys = await redis.keys('campaign:*');
      influxdb(200, `redis_size_campaigns_${campaignRedisKeys.length}_for_${computerName}`);
    };
    setInterval(checkRedisSizeCampaigns, IntervalTime.CHECK_REDIS_SIZE_CAMPAIGNS);

    const checkRedisSizeOffers = async () => {
      const offersRedisKeys = await redis.keys('offer:*');
      influxdb(200, `redis_size_offers_${offersRedisKeys.length}_for_${computerName}`);
    };
    setInterval(checkRedisSizeOffers, IntervalTime.CHECK_REDIS_SIZE_OFFERS);
  }
};
