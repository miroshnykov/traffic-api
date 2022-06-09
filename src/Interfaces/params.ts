import { IExitOfferResult, IOffer } from './offers';
import { ICampaign } from './campaigns';
import { ICustomPayOutPerGeo } from './customPayOutPerGeo';
import { IRedirectType } from './recipeTypes';
import { ICapsResult } from './caps';
import { IFingerPrintData } from './fp';
import { ILid } from './lid';

export interface IParams {
  offerId: number
  campaignId: number
  subCampaign?: string
  cid?: string
  affiliateId: number
  affiliateStatus: string
  affiliateType: string | null
  campaignStatus: string
  affiliateManagerId: number
  offerType: string
  deviceType: string
  offerName: string
  offerDescription: string
  conversionType: string
  landingPageId: number
  landingPageUrl: string
  isUseDefaultOfferUrl?: boolean
  payIn: number
  payOut: number
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
  offersAggregatedIdsProportionals?: any
  offersAggregatedIdsMargin?: any
  groupBestOffer?: number
  startEndDateSetup?: boolean
  capOverrideOfferId?: number
  originAdvertiserId?: number
  originAdvertiserName?: string
  originConversionType?: string
  originIsCpmOptionEnabled?: boolean | number
  originOfferId?: number
  originVerticalId?: number
  originVerticalName?: string
  originPayIn?: number
  originPayOut?: number
  lidObj?: ILid
  landingPageIdOrigin?: number
  landingPageUrlOrigin?: string
  offerIdRedirectExitTraffic?: number
  eventType?: string
  capsResult?: ICapsResult | any
  IP?: string
  isExitOffer: boolean
  isUniqueVisit: boolean
  exitOfferInfo?: IOffer
  exitOffersNested?: IOffer[] | any
  exitOfferResult?: IExitOfferResult | any
  fingerPrintKey?: string
  fingerPrint?: IFingerPrint | any
}

export interface IFingerPrint {
  info?: string
  fpData?: IFingerPrintData
}

export interface IDecodedUrl {
  offerId: number
  campaignId: number
}

export interface IBaseResponse {
  success: boolean;
  params?: IParams;
}

export interface IResponse extends IBaseResponse{
  errors?: any;
  debug?: boolean;
  block?: boolean;
  blockReason?: string;
}

export interface IBestOffer extends IBaseResponse{
  bestOfferId: number
}

export const ILandingPageParams: (string)[] = ['subid', 'cid', 'lid', 'affiliateId'];
