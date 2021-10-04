import {promises as fs} from "fs";
import consola from "consola";
import {Request} from "express";
import maxmind, {CityResponse, IspResponse} from 'maxmind';
import {getClientIp} from "request-ip"
import * as dotenv from "dotenv";
import {influxdb} from "./metrics";

dotenv.config();
let ipData: CityResponse | null
let ISP: IspResponse | null
export const resolveIP = async (req: Request) => {
  try {
    // consola.info('process.env.MAXMIND_PATH:',process.env.MAXMIND_PATH)
    // consola.info('process.env.MAXMIND_PATH_ISP:',process.env.MAXMIND_PATH_ISP)
    const lookup = await maxmind.open<CityResponse>(process.env.MAXMIND_PATH || '');
    const lookupIPR = await maxmind.open<IspResponse>(process.env.MAXMIND_PATH_ISP || '');
    let ip: string = getClientIp(req) || ''

    if (process.env.NODE_ENV === 'development') {
      ip = '199.102.242.155'
    }
    consola.info(`IP address:${ip}`)
    ipData = lookup.get(ip)
    ISP = lookupIPR.get(ip)

  } catch (e) {
    influxdb(500, 'maxmind_error')
    consola.error(`Maxmind does not work or does not setup properly,`, e)
  } finally {
    return resolveGeo(ipData, ISP)
  }
}

const resolveGeo = (ipData: any, ISP: any) => {

  const country: string = ipData?.country?.iso_code || null
  const region: string = ipData?.subdivisions[0]?.iso_code || null
  const city: string = ipData?.city?.names?.en ? ipData?.city?.names?.en : ipData?.city?.names?.fr || null
  const ll: Array<string> = [ipData?.location?.latitude, ipData?.location?.longitude]
  const isp: string = ISP?.isp

  return {
    country,
    region,
    city,
    ll,
    isp
  }
}
