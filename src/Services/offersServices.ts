import {Request, Response, NextFunction} from 'express';
import {getOffer} from '../Models/offersModel'
import {getCampaign} from '../Models/campaignsModel'
import DeviceDetector from "device-detector-js";
import * as QueryString from "querystring";
import {resolveIP} from "../Utils/geo";
import {influxdb} from "../Utils/metrics";
import consola from "consola";
import {decrypt} from "../Utils/decrypt";
import {createLidOffer} from "../Utils/dynamoDb"
import {offersDefaultRedirection} from "./offers/defaultRedirection"
import {offerAggregatedCalculations} from "./offers/offersAggregated"
import {offersStartEndDateSetupCalculations} from "./offers/restrictions/offersStartEndDateSetup"
import {offersGeoRestrictions} from "./offers/restrictions/offersGeoRestrictions"
import {offersCustomLpRules} from "./offers/restrictions/offersCustomLpRules"
import {capsChecking} from "./offers/caps/capsSetup"
import {campaignsTargetRules} from "./campaigns/restrictions/targetRules"
import {v4} from "uuid"

interface IGeo {
  country: string
  region: string
  city: string
  isp: string
  ll: Array<string>
}

// http://localhost:5000/ad?offer=6194f64326946ddc0082fe24b23742fd:4f54afd33b68d65e1bc0db4a28d99cfca323a44d8de9390b53a68b192c2ffc669c7893750d2d049e5696d98f43a172a8&debugging=debugging

// http://localhost:5000/ad?offer=3f5517b50e9a5b827e20a5c34f5adf65:6f3812b10a17b668a17fb2b0a4f18043dfd940d71a0d42899a8a2506ddf767d69aee2d22c866f152a0d0105344f9f0a5&debugging=debugging
//
// http://localhost:5000/ad?offer=953f0918f3c5927377954e0a9feae40d:b067aca287f4fe9991276dd1bfaa9e7ad2defdcbc8cb69d6c9d3153523933762ed2027e4ad6eac3a1a2a8ab1e6d41ef8&debugging=debugging
export const offersServices = async (req: Request) => {
  try {
    influxdb(200, 'offers_all_request')
    let params = await getParams(req)
    if (params.offerInfo.type === 'aggregated') {
      // http://localhost:5000/ad?offer=f9c57171977587f093370d3289ae6ad9:0ee91f0de08ae5099a1efc0e22933b549cca6ce96d3ec39123963fad79e4b5500b5fa843459a83796d951daae99bfab0&debugging=debugging
      const offerAggregatedRes = await offerAggregatedCalculations(params)
      if (offerAggregatedRes) {
        influxdb(200, 'offer_aggregated')
        consola.info(` **** info aggregated lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.startEndDateSetup) {
      const offersStartEndDateSetupRes = await offersStartEndDateSetupCalculations(params)
      if (offersStartEndDateSetupRes) {
        influxdb(200, 'offer_start_end_date_setup')
        consola.info(` **** info startEndDateSetup lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.geoRules) {
      const offersGeoRestrictionsRes = await offersGeoRestrictions(params)
      if (offersGeoRestrictionsRes) {
        influxdb(200, 'offer_geo_rules')
        consola.info(` **** info geoRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }

    }

    if (params.offerInfo.customLpRules) {
      const offersCustomLpRulesRes = await offersCustomLpRules(params)
      if (offersCustomLpRulesRes) {
        influxdb(200, 'offer_custom_lp_rules')
        consola.info(` **** info customLpRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }

    }
    // http://localhost:5000/offer?ad=44669c38ea032aa63b94b904804131c8:2aad25bba4a84235956c7d8884fc53b85f9f5c3f3468544ae69880a225115c5dc9822ae051f70559d674a439ca272cac&debug=debug
    if (params.offerInfo.capSetup) {
      let capsCheckingRes = await capsChecking(params)
      if (capsCheckingRes) {
        consola.info(` **** info capSetup lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }

    }

    if (params.campaignInfo.targetRules) {
      let campaignsTargetRulesRes = await campaignsTargetRules(params)
      if (campaignsTargetRulesRes) {
        influxdb(200, 'offer_target_rules')
        consola.info(` **** info targetRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    let resOffer = await offersDefaultRedirection(params)
    influxdb(200, 'offer_default_redirection')
    consola.info(`Info default lid { ${params.lid} } data ${JSON.stringify(params)}`)
    return {
      success: true,
      data: resOffer
    }

  } catch (e) {
    consola.error('Service offer error:', e)
    influxdb(500, 'offer_ad_error')
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
    const offerEncoded: string = String(req.query.offer! || '')
    const decodedString: string = decrypt(offerEncoded)
    const decodedObj: IDecodedUrl = JSON.parse(decodedString!)
    const {offerId, campaignId} = decodedObj
    let offer = await getOffer(offerId)
    if (!offer) {
      influxdb(500, `offer_${offerId}_recipe_error`)
      throw Error(`no offerId ${offerId} in recipe`)
    }
    let campaign = await getCampaign(campaignId)
    if (!campaign) {
      influxdb(500, `campaign_${campaignId}_recipe_error`)
      throw Error(`no campaignId-${campaignId} in recipe`)
    }
    let offerInfo = JSON.parse(offer!)
    let campaignInfo = JSON.parse(campaign!)
    let startTime: number = new Date().getTime()
    const deviceDetector = new DeviceDetector();
    const userAgent = req.headers['user-agent'] || ''
    let deviceInfo = deviceDetector.parse(userAgent)

    const deviseType: string = deviceInfo?.device?.type!

    // @ts-ignore
    const browserEngine = deviceInfo?.client?.engine || ''

    const browserVersion = deviceInfo?.client?.version!
    const offerHash = req.query.offer
    const browser: string = deviceInfo?.client?.name!
    const os: string = deviceInfo?.os?.name!
    const host: string = req?.headers?.host!
    const originalUrl: string = req?.originalUrl!
    // let adDomain: string | string[] | QueryString.ParsedQs | QueryString.ParsedQs[];
    const adDomain = req?.query?.ad_domain!;
    const debug: boolean = req?.query?.debugging! === 'debugging';
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
    const payin: number = offerInfo.payin
    const payout: number = campaignInfo.payout && campaignInfo.payout || offerInfo.payout
    const isCpmOptionEnabled: boolean = offerInfo.isCpmOptionEnabled

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
      payin,
      payout,
      isCpmOptionEnabled,
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
    influxdb(500, `get_params_error`)
    consola.error('getParamsError:', e)
    throw Error(e)
  }

}
