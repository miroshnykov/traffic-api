import axios from 'axios';
import consola from 'consola';
import * as dotenv from 'dotenv';
import Base64 from 'js-base64';
import md5 from 'md5';
import os from 'node:os';
import { influxdb } from './metrics';
import { IRedshiftData } from '../Interfaces/redshiftData';

const computerName = os.hostname();

dotenv.config();

const aggrRequest = axios.create({
  baseURL: process.env.AGGREGATOR_API,
});

export const sendToAggregator = (stats: IRedshiftData): void => {
  try {
    const eventType: string = String(stats.event_type);
    const statsClone: IRedshiftData = { ...stats };
    const timeCurrent: number = new Date().getTime();

    const params: object = {
      method: 'POST',
      url: 'offer',
      data: {
        key: Base64.encode(JSON.stringify(statsClone)),
        event: eventType,
        time: timeCurrent,
        count: 1,
      },
    };

    aggrRequest(params).then().catch((e) => {
      influxdb(500, 'send_to_aggregator_error');
      consola.error(`computerName:${computerName}send to aggregator data got error:`, e);
    });
  } catch (e) {
    influxdb(500, 'send_to_aggregator_error');
    consola.error('sendToAggregatorError:', e);
  }
};

export const sendBonusLidToAggregator = async (stats: IRedshiftData): Promise<any> => {
  try {
    const timestamp = Date.now();
    const secret = process.env.GATEWAY_API_SECRET;
    const hash = md5(`${timestamp}|${secret}`);

    const params: object = {
      method: 'POST',
      url: 'lidBonus',
      data: {
        stats,
        timestamp,
        hash,
      },
    };
    const { data } = await aggrRequest(params);
    return data;
  } catch (e) {
    influxdb(500, 'send_to_aggregator_error');
    consola.error('sendBonusLidToAggregatorError:', e);
    return [];
  }
};
