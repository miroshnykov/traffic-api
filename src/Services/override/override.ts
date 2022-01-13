import {IParams} from "../../Interfaces/params";

import consola from "consola";
import {getOffer} from '../../Models/offersModel'
import {IOffer, IOfferType} from "../../Interfaces/offers";
import {REDIRECT_URLS} from "../../Utils/defaultRedirectUrls";
import {getDefaultOfferUrl, OFFER_DEFAULT} from "../../Utils/defaultOffer";
import {IRedirectType} from "../../Interfaces/recipeTypes";
import {identifyBestOffer} from "../offers/offersAggregated";

export const override = async (
  params: IParams,
  offerIdRedirectExitTraffic: number
): Promise<void> => {
  try {
    const overrideOfferId = offerIdRedirectExitTraffic ? offerIdRedirectExitTraffic : OFFER_DEFAULT.OFFER_ID

    const offerExitTraffic: any = await getOffer(overrideOfferId)
    let offerExitTrafficInfo: IOffer = JSON.parse(offerExitTraffic)

    // PH-577
    if (offerExitTrafficInfo.type === IOfferType.AGGREGATED) {
      params.redirectReason = `Offers Aggregated exit traffic to aggregatedOffer`
      params.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_AGGREGATED_OFFER
      const exitTrafficBestOfferId = identifyBestOffer(offerExitTrafficInfo?.offersAggregatedIds!, params)
      if (exitTrafficBestOfferId) {
        const offerExitTrafficBestOffer: any = await getOffer(exitTrafficBestOfferId)
        offerExitTrafficInfo = JSON.parse(offerExitTrafficBestOffer)
      } else {
        const defaultOffer: any = await getOffer(OFFER_DEFAULT.OFFER_ID)
        offerExitTrafficInfo = JSON.parse(defaultOffer)
      }
    }

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

    let landingPageUrl: string
    if (!offerExitTrafficInfo?.landingPageUrl) {
      landingPageUrl = await getDefaultOfferUrl() || REDIRECT_URLS.DEFAULT
      params.isUseDefaultOfferUrl = true
      consola.info(`exitOfferUrl is empty will use default offer url:${landingPageUrl}`)
    } else {
      landingPageUrl = offerExitTrafficInfo?.landingPageUrl
    }
    params.landingPageUrl = landingPageUrl
    params.landingPageId = offerExitTrafficInfo?.landingPageId
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

