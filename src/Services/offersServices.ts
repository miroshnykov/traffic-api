import {Request, Response} from 'express';
import {getOffer} from '../Models/offersModel'
import {getCampaign} from '../Models/campaignsModel'
import DeviceDetector from "device-detector-js";
import * as QueryString from "querystring";
import {resolveIP} from "../Utils/geo";
import consola from "consola";

interface IGeo {
  country: string
  region: string
  city: string
  isp: string
  ll: Array<string>
}

export const offersServices = async (req: Request) => {
  try {
    let params = await getParams(req)
    let calculations = {}
    return params
  } catch (e) {
    console.log('Service offer error:', e)
  }

};

const getParams = async (req: Request) => {
  try {
    const offerId: number = +req.query.offerId! || 0
    const campaignId: number = +req.query.campaignId! || 0
    let offer = await getOffer(offerId)
    let campaign = await getCampaign(campaignId)
    let offerInfo = JSON.parse(offer!)
    let campaignInfo = JSON.parse(campaign!)
    let startTime = new Date()
    const deviceDetector = new DeviceDetector();
    const userAgent = req.headers['user-agent'] || ''
    let deviceInfo = deviceDetector.parse(userAgent)

    const deviseType: string = deviceInfo?.device?.type!
    let browserEngine
    if ("engine" in deviceInfo?.client!) {
      browserEngine = deviceInfo?.client?.engine!

    }
    const browserVersion = deviceInfo?.client?.version!
    const offerHash = req.query.offer
    const browser: string = deviceInfo?.client?.name!
    const os: string = deviceInfo?.os?.name!
    const host: string = req?.headers?.host!
    const originalUrl: string = req?.originalUrl!
    // let adDomain: string | string[] | QueryString.ParsedQs | QueryString.ParsedQs[];
    const adDomain = req?.query?.ad_domain!;
    const debug: boolean = req?.query?.debug! === 'debug';
    const referer = req.headers['referer'];
    const geoInfo: IGeo = await resolveIP(req)
    const country: string = geoInfo?.country
    const region: string = geoInfo?.region
    const city: string = geoInfo?.city
    const isp: string = geoInfo?.isp
    return {
      deviseType,
      offerInfo,
      campaignInfo,
      browser,
      host,
      originalUrl,
      adDomain,
      userAgent,
      referer,
      browserEngine,
      browserVersion,
      os,
      debug,
      geoInfo,
      country,
      city,
      isp,
      region,
      offerHash,
      startTime
    };

  } catch (e) {
    consola.error('getParamsError:', e)
  }

}
