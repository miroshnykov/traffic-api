import http, {Server} from 'http'
import cluster, {Worker} from 'cluster'
import {cpus, CpuInfo} from 'os'
import consola from 'consola'
import chalk from 'chalk'
import express, {Application, Request, Response, NextFunction} from 'express'
import * as bodyParser from 'body-parser';
// import {offer} from './routing'
// import {offer} from './Routes/offer'
import routes from './Routes/index';
import {setOffersToRedis} from './Crons/offersToRedisCron'
import {setCampaignsToRedis} from "./Crons/campaignsToRedisCron";
import {io} from "socket.io-client";

const app: Application = express();

let coreThread: CpuInfo[] = cpus();
import 'dotenv/config';
import {getOffersFileFromBucket} from "./Crons/offersReceipS3Cron";
import {getCampaignsFileFromBucket} from "./Crons/campaignsReceipS3Cron";
import {sendToAggrOffer} from "./Utils/aggregator";
import {setSqsDataToRedis} from "./Utils/cache";
import {redis} from "./redis";

let logBufferOffer: { [index: string]: any } = {}

const addToBufferOffer = (buffer: any, t: number, msg: string) => {
  if (!buffer[t]) {
    buffer[t] = [];
  }
  buffer[t][buffer[t].length] = msg;
}

coreThread.length = 1

function loggerMiddleware(request: express.Request, response: express.Response, next: NextFunction) {
  consola.info(`${request.method} ${request.path}`);
  next();
}

consola.info(`Cores number:${coreThread.length}`)
if (cluster.isMaster) {

  // let host = 'http://localhost:3001/'

  const socketHost: string = process.env.SOCKET_HOST || ''
  const socket = io(socketHost);

  socket.on('connect', () => {
    console.log(`Socket connected, host: ${socketHost}`)
  });

  socket.on('fileSizeOffersCheck', async (offersSize: number) => {

    try {
      consola.warn('Size offers from recipe and from engine is different  ')
      consola.info('GET from recipe fileSizeOffersCheck:', offersSize)
      consola.info(`Re-download new recipe offers from S3`)
      setTimeout(getOffersFileFromBucket, 6000)
      setTimeout(setOffersToRedis, 20000)
    } catch (e) {
      console.log(`fileSizeOffersInfoError:`, e)
    }
  })

  socket.on('fileSizeCampaignsCheck', async (campaignsSize) => {

    try {
      consola.warn('Size campaigns from recipe and from engine is different  ')
      consola.info('GET from recipe fileSizeCampaignsCheck:', campaignsSize)
      consola.info(`Re-download new recipe campaigns from S3`)
      setTimeout(getCampaignsFileFromBucket, 6000)
      setTimeout(setCampaignsToRedis, 20000)
    } catch (e) {
      console.log(`fileSizeCampaignsInfoError:`, e)
    }
  })

  socket.on('updRecipe', async (message) => {
    await setSqsDataToRedis(message)
  })

  const setOffersCheckSize: () => Promise<void> = async () => {
    try {
      let offerSize: number = Number(await redis.get(`offersSize_`))
      socket.emit('fileSizeOffersCheck', offerSize)
    } catch (e) {
      consola.error(`setOffersCheckSizeError:`, e)
    }
  }
  setInterval(setOffersCheckSize, 20000)

  const setCampaignsCheckSize: () => Promise<void> = async () => {
    try {
      let campaignsSize: number = Number(await redis.get(`campaignsSize_`))
      socket.emit('fileSizeCampaignsCheck', campaignsSize)
    } catch (e) {
      consola.error(`setCampaignsCheckSizeError:`, e)
    }
  }
  setInterval(setCampaignsCheckSize, 20000)

  const aggregatorData = async () => {

    let timer = new Date();
    let t:number = Math.round(timer.getTime() / 1000);
    if (Object.keys(logBufferOffer).length >= 5) {
      consola.info('logBufferOffer count:', Object.keys(logBufferOffer).length)
    }
    for (const index in logBufferOffer) {
      if (Number(index) < t - 2) {
        if (logBufferOffer[index].length === 0) return

        for (const j in logBufferOffer[index]) {
          let statsData: object = logBufferOffer[index][j]
          sendToAggrOffer(statsData)

        }
        delete logBufferOffer[index]
      }
    }
  }

  setInterval(aggregatorData, 200000)

  for (let i = 0; i < coreThread.length; i++) {
    cluster.fork()
  }

  const workersTread: any = []
  for (const id in cluster.workers) {
    workersTread.push(id)
  }

  workersTread.forEach(
    async (pid: number, _: number): Promise<void> => {
      // @ts-ignore
      cluster.workers[pid].send({
        from: 'isMaster',
        type: 'SIGKILL',
        message: 'cleanup is worker dead and change to new worker'
      })
    }
  )
  cluster.on('message', (worker: Worker, msg): void => {
    let timer: Date = new Date();
    let t: number = Math.round(timer.getTime() / 1000);
    if (msg.type === "clickOffer") {
      addToBufferOffer(logBufferOffer, t, msg.stats);
    }
  })


  // if (process.env.NODE_ENV !== 'production') {
  cluster.on('online', (worker: Worker): void => {
    if (worker.isConnected()) {
      console.info(`${chalk.greenBright('worker active pid')}: ${worker.process.pid}`)
    }
  })

  cluster.on('exit', (worker: Worker, code: number, signal: string): void => {
    if (worker.isDead()) {
      console.info(`${chalk.redBright('worker dead pid')}: ${worker.process.pid}`)
    }
    cluster.fork()
  })
  // }
  if (process.env.ENV === 'development') {
    // setInterval(setOffersToRedis, 60000) // 60000 -> 60 sec

    // setInterval(getOffersFileFromBucket, 6000)
    setTimeout(getOffersFileFromBucket, 6000)
    setTimeout(setOffersToRedis, 9000)

    // setInterval(setCampaignsToRedis, 60000) // 60000 -> 60 sec
    setTimeout(getCampaignsFileFromBucket, 13000)
    setTimeout(setCampaignsToRedis, 15000)

  }


} else {
  const server = http.createServer(app) as Server
  app.use(loggerMiddleware);
  app.use(bodyParser.json());
  app.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.send('done')
  });

  app.use(routes);
  const host: string = process.env.HOST || ''
  const port: number = parseInt(process.env.PORT || '5000')

  server.listen(port, host, (): void => {
    consola.success(`Server is running on host http://${host}:${port}, env:${process.env.ENV} `)
  })
}