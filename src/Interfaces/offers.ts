import {ICapInfo} from "./caps"

export interface IAggregatedOfferList {
  aggregatedOfferId: number,
  margin: number
}

export interface IOffer {
  offerId: number
  name: string
  advertiserId: number
  advertiserName: string
  verticalId: number
  verticalName: string
  advertiserManagerId: number
  conversionType: string
  currencyId: number
  status: string
  payin: number
  payout: number
  payoutPercent?: number
  isCpmOptionEnabled: boolean | number
  landingPageId: number
  landingPageUrl: string
  sflOfferGeoId: number
  geoRules: string
  geoOfferId: number
  customLpRules: string
  offerIdRedirectExitTraffic: number
  useStartEndDate: boolean
  startDate: Date | null
  endDate: Date | null
  type: string
  customPayOutCount: number
  capOfferId: number
  capSetup?: boolean | undefined
  startEndDateSetup?: boolean | undefined
  startEndDateSetting?: any
  customPayOutPerGeo?: string
  offersAggregatedIds?: IAggregatedOfferList[]
  capInfo?: ICapInfo
  landingPageUrlOrigin?: string | undefined
  offerIdOrigin?: number | undefined
  referredOfferId?: number | undefined
  redirectType?: string | undefined
  redirectReason?: string | undefined
}

