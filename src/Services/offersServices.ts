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
import {offerAggregatedCalculations} from "./offers/offersAggregated"
import {v4} from "uuid"

interface IGeo {
  country: string
  region: string
  city: string
  isp: string
  ll: Array<string>
}

// http://localhost:5000/offer?ad=6194f64326946ddc0082fe24b23742fd:4f54afd33b68d65e1bc0db4a28d99cfca323a44d8de9390b53a68b192c2ffc669c7893750d2d049e5696d98f43a172a8&debug=debug
export const offersServices = async (req: Request) => {
  try {
    let params = await getParams(req)
    let calculations = {}
    if (params.offerInfo.type === 'aggregated') {
      // http://localhost:5000/offer?ad=f9c57171977587f093370d3289ae6ad9:0ee91f0de08ae5099a1efc0e22933b549cca6ce96d3ec39123963fad79e4b5500b5fa843459a83796d951daae99bfab0&debug=debug
      const offerAggregatedRes = await offerAggregatedCalculations(params)
      if (offerAggregatedRes) {
        return {
          success: true,
          data: params
        }
      }
    }

    //caps
    // http://localhost:5000/offer?ad=44669c38ea032aa63b94b904804131c8:2aad25bba4a84235956c7d8884fc53b85f9f5c3f3468544ae69880a225115c5dc9822ae051f70559d674a439ca272cac&debug=debug
    let resOffer = await offersDefaultRedirection(params)

    return {
      success: true,
      data: resOffer
    }

  } catch (e) {
    consola.error('Service offer error:', e)
    return {
      errors: e
    }

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
    if (!offer) {
      throw Error(`no offerId ${offerId} in recipe`)
    }
    let campaign = await getCampaign(campaignId)
    if (!campaign) {
      throw Error(`no campaignId-${campaignId} in recipe`)
    }
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
    const lid: string = v4()

    const affiliateId: string = campaignInfo.affiliateId
    const affiliateManagerId: string = campaignInfo.affiliateManagerId
    const offerType: string = offerInfo.type
    const offerName: string = offerInfo.name
    const conversionType: string = offerInfo.conversionType
    const landingPageId: number = offerInfo.landingPageId
    const landingPageUrl: string = offerInfo.landingPageUrl
    const verticalId: number = offerInfo.verticalId
    const verticalName: string = offerInfo.verticalName
    const advertiserId: number = offerInfo.advertiserId
    const advertiserName: string = offerInfo.advertiserName
    const advertiserManagerId: number = offerInfo.advertiserManagerId

    return {
      offerId,
      campaignId,
      affiliateId,
      affiliateManagerId,
      offerType,
      deviseType,
      offerName,
      conversionType,
      landingPageId,
      landingPageUrl,
      verticalId,
      verticalName,
      advertiserId,
      advertiserName,
      advertiserManagerId,
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
    throw Error(e)
  }

}
