import http, {Server} from 'http'
import cluster, {Worker} from 'cluster'
import os, {CpuInfo, cpus} from 'os'
import consola from 'consola'
import chalk from 'chalk'
import express, {Application, NextFunction, Request, Response} from 'express'
import * as bodyParser from 'body-parser';
// import {offer} from './routing'
// import {offer} from './Routes/offer'
import routes from './Routes/index';
import {setCampaignsToRedis, setOffersToRedis} from './Crons/setRecipeToRedisCron'
import 'dotenv/config';
import {getFileFromBucket} from "./Crons/getReceipS3Cron";
import {sendToAggrOffer} from "./Utils/aggregator";
import {influxdb} from "./Utils/metrics";
import {IRedshiftData} from "./Interfaces/redshiftData";
import {IRecipeType} from "./Interfaces/recipeTypes";
import {socketConnection} from "./socket";
import {ISocketType} from "./Interfaces/socketTypes";

const computerName = os.hostname()

const app: Application = express();

let coreThread: CpuInfo[] = cpus();

let logBufferOffer: { [index: string]: any } = {}

const addToBufferOffer = (buffer: any, t: number, msg: string) => {
  if (!buffer[t]) {
    buffer[t] = [];
  }
  buffer[t][buffer[t].length] = msg;
}

// coreThread.length = 1

function loggerMiddleware(request: express.Request, response: express.Response, next: NextFunction) {
  // consola.info(`${request.method} ${request.path}`);
  next();
}

consola.info(`Cores number:${coreThread.length}`)
if (cluster.isMaster) {

  socketConnection(ISocketType.MASTER)
  // socketConnection(ISocketType.SLAVE)

  const aggregatorData = async () => {

    const timer = new Date();
    const currenTime: number = Math.round(timer.getTime() / 1000);
    if (Object.keys(logBufferOffer).length >= 5) {
      consola.info(`aggregator logBufferOffer count:${Object.keys(logBufferOffer).length}` )
    }
    for (const index in logBufferOffer) {
      if (Number(index) < currenTime - 5) {
        if (logBufferOffer[index].length === 0) return

        for (const j in logBufferOffer[index]) {
          let statsData: IRedshiftData = logBufferOffer[index][j]
          sendToAggrOffer(statsData)

        }
        delete logBufferOffer[index]
      }
    }
  }

  setInterval(aggregatorData, 20000) // 20 sec

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
    const timer: Date = new Date();
    const currenTime: number = Math.round(timer.getTime() / 1000);
    if (msg.type === "clickOffer") {
      addToBufferOffer(logBufferOffer, currenTime, msg.stats);
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
      influxdb(500, `worker_dead`)
      console.info(`${chalk.redBright('worker dead pid')}: ${worker.process.pid}`)
    }
    cluster.fork()
  })
  // }
  setTimeout(getFileFromBucket, 6000, IRecipeType.OFFER)
  setTimeout(setOffersToRedis, 12000)

  setTimeout(getFileFromBucket, 13000, IRecipeType.CAMPAIGN)
  setTimeout(setCampaignsToRedis, 20000)

} else {
  const server = http.createServer(app) as Server
  app.use(loggerMiddleware);
  app.use(bodyParser.json());
  app.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.send('Ok')
  });

  app.use(routes);
  const host: string = process.env.HOST || ''
  const port: number = parseInt(process.env.PORT || '5000')

  server.listen(port, host, (): void => {
    consola.success(`Server is running on host http://${host}:${port}, env:${process.env.NODE_ENV} `)
  })
}