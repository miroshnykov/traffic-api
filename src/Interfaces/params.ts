import {IOffer} from "./offers"
import {ICampaign} from "./campaigns";
import {ICustomPayOutPerGeo} from "./customPayOutPerGeo";
import {IRedirectType} from "./recipeTypes";
import {ICapsResult} from "./caps";

export interface IParams {
  offerId: number
  campaignId: number
  affiliateId: number
  affiliateManagerId: number
  offerType: string
  deviceType: string
  offerName: string
  conversionType: string
  landingPageId: number
  landingPageUrl: string
  payin: number
  payout: number
  payoutPercent: number
  isCpmOptionEnabled: boolean | number
  verticalId: number
  verticalName: string
  advertiserId: number
  advertiserName: string
  advertiserManagerId: number
  offerInfo: IOffer
  campaignInfo: ICampaign
  lid: string
  browser: string
  host: string
  domain?: string
  originalUrl: string
  userAgent: string
  browserEngine: string
  browserVersion: string
  adDomain?: string
  os: string
  platform: string
  geoInfo: object
  country: string
  city: string
  isp: string
  region: string
  offerHash: any
  startTime: number
  speedTime: number
  customPayOutPerGeo?: ICustomPayOutPerGeo
  referer?: string
  redirectReason?: string | undefined
  redirectType?: IRedirectType
  redirectUrl: string
  geoRules?: string
  groupOffer?: boolean
  offersAggregatedIds?: object[]
  offersAggregatedIdsToRedirect?: any
  offersAggregatedIdsMargin?: any
  groupBestOffer?: number
  startEndDateSetup?: boolean
  capOverrideOfferId?: number
  referredAdvertiserId?: number
  referredAdvertiserName?: string
  referredConversionType?: string
  referredIsCpmOptionEnabled?: boolean | number
  referredOfferId?: number
  referredVerticalId?: number
  referredVerticalName?: string
  lidObj?: object
  referredPayIn?: number
  referredPayOut?: number
  landingPageIdOrigin?: number
  landingPageUrlOrigin?: string
  offerIdRedirectExitTraffic?: number
  eventType?: string
  capsResult?: ICapsResult | any
  IP?: string
}

export interface IDecodedUrl {
  offerId: number
  campaignId: number
}

export interface IResponse {
  success: boolean;
  data?: IParams;
  errors?: any;
  debug?: boolean;
}