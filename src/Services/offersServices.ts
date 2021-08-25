import {Request, Response, NextFunction} from 'express';
import {getOffer} from '../Models/offersModel'
import {getCampaign} from '../Models/campaignsModel'
import DeviceDetector from "device-detector-js";
import * as QueryString from "querystring";
import {resolveIP} from "../Utils/geo";
import consola from "consola";
import {decrypt} from "../Utils/decrypt";
import {createLidOffer} from "../Utils/dynamoDb"
import {offersDefaultRedirection} from "./offers/defaultRedirection"
import {v4} from "uuid"

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
    let resOffer = await offersDefaultRedirection(params)
    return resOffer
  } catch (e) {
    console.log('Service offer error:', e)
  }

};

interface IDecodedUrl {
  offerId: number
  campaignId: number
}

const getParams = async (req: Request) => {
  try {
    // const offerId: number = +req.query.offerId! || 0
    // const campaignId: number = +req.query.campaignId! || 0
    const offerEncoded: string = String(req.query.ad! || '')
    const decodedString: string = decrypt(offerEncoded)
    const decodedObj: IDecodedUrl = JSON.parse(decodedString!)
    const {offerId, campaignId} = decodedObj
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
    const lid :string = v4()
    return {
      deviseType,
      offerInfo,
      lid,
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
