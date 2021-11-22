import axios from "axios"
import consola from "consola";
import * as dotenv from "dotenv";
import Base64 from "js-base64"
import {influxdb} from "./metrics";
import {IRedshiftData} from "../Interfaces/redshiftData";

dotenv.config();

const aggrRequest = axios.create({
  baseURL: process.env.AGGREGATOR_API,
})

export const sendToAggregator = (stats: IRedshiftData) => {

  try {
    let eventType: string = String(stats.event_type)
    let statsClone: IRedshiftData = Object.assign({}, stats)
    let timeCurrent: number = new Date().getTime()

    let params: object = {
      method: 'POST',
      url: `offer`,
      data: {
        key: Base64.encode(JSON.stringify(statsClone)),
        event: eventType,
        time: timeCurrent,
        count: 1
      }
    }

    aggrRequest(params).then().catch(e => {
      influxdb(500, 'send_to_aggregator_error')
      consola.error('send to aggregator data got error:', e)
    })

  } catch (e) {
    influxdb(500, 'send_to_aggregator_error')
    consola.error('sendToAggregatorError:', e)
  }
}