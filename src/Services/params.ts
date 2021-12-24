import {Request} from "express";
import {decrypt} from "../Utils/decrypt";
import {IDecodedUrl, IFingerPrint, IParams} from "../Interfaces/params";
import {getOffer} from "../Models/offersModel";
import {influxdb} from "../Utils/metrics";
import {getCampaign} from "../Models/campaignsModel";
import DeviceDetector from "device-detector-js";
import {resolveIP} from "../Utils/geo";
import {v4} from "uuid";
import consola from "consola";
import {IExitOfferResult, IOffer} from "../Interfaces/offers";
import {ICampaign} from "../Interfaces/campaigns";
import {IGeo} from "../Interfaces/geo";
import {ICapsResult} from "../Interfaces/caps";

export const getParams = async (req: Request): Promise<IParams> => {
  try {
    const offerEncoded: string = String(req.query.o! || '')
    const encKey: string = process.env.ENCRIPTION_KEY || ''
    const decodedString: string = decrypt(offerEncoded, encKey)
    // const decodedObj: IDecodedUrl = JSON.parse(decodedString!)
    // const offerId: number = Number(decodedObj.offerId)
    // const campaignId: number = Number(decodedObj.campaignId)

    const inputData = decodedString.split("|");
    const offerId: number = Number(inputData[0])
    const campaignId: number = Number(inputData[1])

    const offer = await getOffer(offerId)
    if (!offer) {
      influxdb(500, `offer_${offerId}_recipe_error`)
      throw Error(`no offerId ${offerId} in recipe`)
    }
    const campaign = await getCampaign(campaignId)
    if (!campaign) {
      influxdb(500, `campaign_${campaignId}_recipe_error`)
      throw Error(`no campaignId-${campaignId} in recipe`)
    }
    const offerInfo: IOffer = JSON.parse(offer!)
    const campaignInfo: ICampaign = JSON.parse(campaign!)

    const startTime: number = new Date().getTime()
    const speedTime: number = 0

    const deviceDetector = new DeviceDetector();
    const userAgent = req.headers['user-agent'] || ''
    const deviceInfo = deviceDetector.parse(userAgent)

    const deviceType: string = deviceInfo?.device?.type!

    // @ts-ignore
    const browserEngine = deviceInfo?.client?.engine || ''

    const browserVersion = String(deviceInfo?.client?.version!)
    const offerHash = req.query.o
    const browser: string = String(deviceInfo?.client?.name!)
    const os: string = String(deviceInfo?.os?.name!)
    const platform: string = String(deviceInfo?.os?.platform!)
    const host: string = String(req?.headers?.host!)
    const originalUrl: string = String(req?.originalUrl!)
    const adDomain: string = String(req?.query?.ad_domain!)
    const referer = req.headers['referer'] || ''
    const geoInfo: IGeo = await resolveIP(req)
    const country: string = String(geoInfo?.country)
    const region: string = String(geoInfo?.region)
    const city: string = String(geoInfo?.city)
    const isp: string = String(geoInfo?.isp)
    const IP: string = String(geoInfo?.IP)
    const lid: string = v4()

    const affiliateId: number = Number(campaignInfo.affiliateId)
    const affiliateManagerId: number = Number(campaignInfo.affiliateManagerId)
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
    const payin: number = Number(offerInfo.payin)
    const payoutPercent: number = Number(offerInfo.payoutPercent)
    const payout: number = Number(campaignInfo.payout && campaignInfo.payout || offerInfo.payout)
    const isCpmOptionEnabled: boolean | number = offerInfo.isCpmOptionEnabled
    const redirectUrl: string = ''
    const capsResult: ICapsResult = {}
    const exitOfferResult: IExitOfferResult = {}
    const isExitOffer: boolean = false
    const fingerPrint: IFingerPrint = {}

    return {
      offerId,
      campaignId,
      affiliateId,
      affiliateManagerId,
      offerType,
      deviceType,
      offerName,
      conversionType,
      landingPageId,
      landingPageUrl,
      payin,
      payout,
      payoutPercent,
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
      platform,
      geoInfo,
      country,
      city,
      isp,
      region,
      offerHash,
      startTime,
      speedTime,
      redirectUrl,
      capsResult,
      IP,
      isExitOffer,
      exitOfferResult,
      fingerPrint
    };

  } catch (e) {
    influxdb(500, `get_params_error`)
    consola.error('getParamsError:', e)
    throw Error(e)
  }

}