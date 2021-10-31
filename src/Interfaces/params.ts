import {IOffer} from "./offers"
import {ICampaign} from "./campaigns";
import {ICustomPayOutPerGeo} from "./customPayOutPerGeo";
import {IRedirectType} from "./recipeTypes";

export interface IGeo {
  country: string
  region: string
  city: string
  isp: string
  ll: Array<string>
}

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
  os: string
  platform: string
  debug: boolean
  geoInfo: object
  country: string
  city: string
  isp: string
  region: string
  offerHash: any
  startTime: number
  speedTime: number
  customPayOutPerGeo?: ICustomPayOutPerGeo
  referer?: string | undefined
  redirectReason?: string | undefined
  redirectType?: IRedirectType
  redirectUrl: string
  geoRules?: string
  groupOffer?: boolean
  offersAggregatedIds?: object[]
  offersAggregatedIdsToRedirect?: any
  groupBestOffer?: number
  startEndDateSetup?: boolean
  dateRangeSetUp?: string
  capsType?: string
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
}

export interface IDecodedUrl {
  offerId: number
  campaignId: number
}