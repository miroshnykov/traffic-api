import http, { Server } from 'node:http';
import cluster, { Worker } from 'node:cluster';
import { CpuInfo, cpus } from 'node:os';
import consola from 'consola';
import chalk from 'chalk';
import express, {
  Application, NextFunction, Request, Response,
} from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as bodyParser from 'body-parser';
import Fingerprint from 'express-fingerprint';
// eslint-disable-next-line import/no-cycle
import routes from './Routes/index';
import 'dotenv/config';
import { getFileFromBucket } from './Crons/getReceipS3Cron';
// eslint-disable-next-line import/no-cycle
import { sendToAggregator } from './Utils/aggregator';
import { influxdb, sendMetricsSystem } from './Utils/metrics';
import { IRedshiftData } from './Interfaces/redshiftData';
import { IRecipeType } from './Interfaces/recipeTypes';
import { socketConnection } from './socket';
import { ISocketType } from './Interfaces/socketTypes';
import { sendLidDynamoDb } from './Utils/dynamoDb';
import { IntervalTime } from './Constants/intervalTime';
// import {setOffersToRedis} from "./Crons/setRecipeToRedisCron";

const app: Application = express();

const coreThread: CpuInfo[] = cpus();

const logBufferOffer: { [index: string]: any } = {};

const addToBufferOffer = (buffer: any, t: number, msg: string) => {
  if (!buffer[t]) {
    // eslint-disable-next-line no-param-reassign
    buffer[t] = [];
  }
  // eslint-disable-next-line no-param-reassign
  buffer[t][buffer[t].length] = msg;
};
const failedLidsData: IRedshiftData[] = [];
// coreThread.length = 1;

export const failedLidsObj = (stats: IRedshiftData) => {
  failedLidsData.push(stats);
};

const failedLidsDynamoDbData: any[] = [];
export const failedLidsDynamoDb = (data: any) => {
  failedLidsDynamoDbData.push(data);
};

consola.info(`Cores number:${coreThread.length}`);
if (cluster.isMaster) {
  socketConnection(ISocketType.MASTER);
  socketConnection(ISocketType.SLAVE);

  const aggregatorData = async () => {
    const timer = new Date();
    const currenTime: number = Math.round(timer.getTime() / 1000);
    if (Object.keys(logBufferOffer).length >= 5) {
      consola.info(`aggregator logBufferOffer count:${Object.keys(logBufferOffer).length}`);
    }
    for (const index in logBufferOffer) {
      if (Number(index) < currenTime - 5) {
        if (logBufferOffer[index].length === 0) return;

        // eslint-disable-next-line guard-for-in
        for (const j in logBufferOffer[index]) {
          const statsData: IRedshiftData = logBufferOffer[index][j];
          sendToAggregator(statsData);
        }
        delete logBufferOffer[index];
      }
    }
  };

  setInterval(aggregatorData, IntervalTime.SEND_TO_AGGREGATOR);

  const failedLidsProcess = async () => {
    if (failedLidsData.length === 0) return;
    consola.info('failedLidsProcess:', failedLidsData.length);
    for (let i = 0; i < failedLidsData.length; i++) {
      sendToAggregator(failedLidsData[i]);
      consola.info(`resend lid:${failedLidsData[i].lid}`);
      influxdb(200, 're_send_to_aggregator_data');
      failedLidsData.splice(i, 1);
    }
  };
  setInterval(failedLidsProcess, IntervalTime.FAILED_LIDS_PROCESS);

  const failedLidsDynamoDbProcess = async () => {
    if (failedLidsDynamoDbData.length === 0) return;
    consola.info(`failedLidsDynamoDbData count:${failedLidsDynamoDbData.length}`);
    for (let i = 0; i < failedLidsDynamoDbData.length; i++) {
      consola.info(`resend lid to dynamoDb { ${failedLidsDynamoDbData[i].lid} }`);
      sendLidDynamoDb(failedLidsDynamoDbData[i]);
      influxdb(200, 're_send_to_dynamo_db_failed_lid');
      failedLidsDynamoDbData.splice(i, 1);
    }
  };
  setInterval(failedLidsDynamoDbProcess, IntervalTime.FAILED_LIDS_DYNAMO_DB_PROCESS);

  setInterval(() => {
    if (process.env.NODE_ENV === 'development') return;
    sendMetricsSystem();
  }, IntervalTime.SEND_METRICS_SYSTEM);

  for (let i = 0; i < coreThread.length; i++) {
    cluster.fork();
  }

  const workersTread: any = [];
  // eslint-disable-next-line guard-for-in
  for (const id in cluster.workers) {
    workersTread.push(id);
  }

  workersTread.forEach(
    async (pid: number): Promise<void> => {
      // @ts-ignore
      cluster.workers[pid].send({
        from: 'isMaster',
        type: 'SIGKILL',
        message: 'cleanup is worker dead and change to new worker',
      });
    },
  );
  cluster.on('message', (worker: Worker, msg): void => {
    const timer: Date = new Date();
    const currenTime: number = Math.round(timer.getTime() / 1000);
    if (msg.type === 'clickOffer') {
      addToBufferOffer(logBufferOffer, currenTime, msg.stats);
    }
    if (msg.type === 'failedLidDynamoDb') {
      failedLidsDynamoDb(msg.stats);
    }
  });

  // if (process.env.NODE_ENV !== 'production') {
  cluster.on('online', (worker: Worker): void => {
    if (worker.isConnected()) {
      consola.info(`${chalk.greenBright('worker active pid')}: ${worker.process.pid}`);
    }
  });

  cluster.on('exit', (worker: Worker): void => {
    if (worker.isDead()) {
      influxdb(500, 'worker_dead');
      consola.info(`${chalk.redBright('worker dead pid')}: ${worker.process.pid}`);
    }
    cluster.fork();
  });
  // }
  setTimeout(getFileFromBucket, 6000, IRecipeType.OFFER);
  // setTimeout(setOffersToRedis, 2000);

  setTimeout(getFileFromBucket, 13000, IRecipeType.CAMPAIGN);
  // setTimeout(setCampaignsToRedis, 20000)
} else {
  const server = http.createServer(app) as Server;
  app.use(bodyParser.json());
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.send('Ok');
  });

  app.use(Fingerprint({
    parameters: [
      // @ts-ignore
      Fingerprint.useragent,
      // @ts-ignore
      Fingerprint.acceptHeaders,
      // @ts-ignore
      Fingerprint.geoip,
    ],
  }));

  app.use(routes);
  const host: string = process.env.HOST || '';
  const port: number = Number(process.env.PORT || '5000');

  server.listen(port, host, (): void => {
    consola.success(`Server is running on host http://${host}:${port}, env:${process.env.NODE_ENV} Using node - { ${process.version} } `);
  });
}
