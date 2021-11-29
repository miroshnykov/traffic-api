import {IParams} from "../../Interfaces/params";

import consola from "consola";
import {getOffer} from '../../Models/offersModel'
import {IOffer} from "../../Interfaces/offers";
import {REDIRECT_URLS} from "../../Utils/defaultRedirectUrls";
import {OFFER_DEFAULT} from "../../Utils/defaultOffer";

export const override = async (params: IParams, offerIdRedirectExitTraffic: number): Promise<void> => {

  const overrideOfferId = offerIdRedirectExitTraffic ? offerIdRedirectExitTraffic : OFFER_DEFAULT.OFFER_ID

  const offerExitTraffic: any = await getOffer(overrideOfferId)
  const offerExitTrafficInfo: IOffer = JSON.parse(offerExitTraffic)

  try {

    params.isExitOffer = true
    params.exitOfferInfo = offerExitTrafficInfo
    params.originPayIn = Number(params.offerInfo?.payin)
    params.originPayOut = Number(params.offerInfo?.payout)
    params.originAdvertiserId = params.offerInfo?.advertiserId || 0
    params.originAdvertiserName = params.offerInfo?.advertiserName || ''
    params.originConversionType = params.offerInfo?.conversionType || ''
    params.originIsCpmOptionEnabled = params.offerInfo?.isCpmOptionEnabled || 0
    params.originOfferId = params.offerInfo?.offerId || 0
    params.originVerticalId = params.offerInfo?.verticalId || 0
    params.originVerticalName = params.offerInfo?.verticalName || ''

    params.landingPageIdOrigin = params.offerInfo?.landingPageId || 0
    params.landingPageUrlOrigin = params.offerInfo?.landingPageUrl || ''
    params.offerIdRedirectExitTraffic = params.offerInfo?.offerIdRedirectExitTraffic || 0

    params.landingPageUrl = offerExitTrafficInfo?.landingPageUrl
    params.advertiserId = offerExitTrafficInfo?.advertiserId || 0
    params.advertiserName = offerExitTrafficInfo?.advertiserName || ''
    params.conversionType = offerExitTrafficInfo?.conversionType || ''
    params.isCpmOptionEnabled = offerExitTrafficInfo?.isCpmOptionEnabled || 0
    params.offerId = offerExitTrafficInfo?.offerId || 0
    params.verticalId = offerExitTrafficInfo?.verticalId || 0
    params.verticalName = offerExitTrafficInfo?.verticalName || ''

    params.payin = offerExitTrafficInfo && offerExitTrafficInfo?.payin || 0
    params.payout = offerExitTrafficInfo && offerExitTrafficInfo?.payout || 0


  } catch (e) {
    consola.error('override fields error', e)
  }
}

