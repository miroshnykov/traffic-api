import axios from "axios"
import consola from "consola";
import * as dotenv from "dotenv";
import Base64 from "js-base64"

dotenv.config();

const aggrRequest = axios.create({
  baseURL: process.env.AGGREGATOR_API,
})

export const sendToAggrOffer = async (stats: any) => {

  try {
    let eventType: string = String(stats.event_type)
    let statsClone: object = Object.assign({}, stats)
    let timeCurrent: number = new Date().getTime()

    let params: object = {
      method: 'POST',
      url: `sfloffer`,
      data: {
        key: Base64.encode(JSON.stringify(statsClone)),
        event: eventType,
        time: timeCurrent,
        count: 1
      }
    }

    consola.info(`send to aggregator before send, data: ${JSON.stringify(params)}`)
    // @ts-ignore
    const {data} = await aggrRequest(params)
    return data

  } catch (e) {
    consola.error('sendToAggrOfferError:', e)
  }
}