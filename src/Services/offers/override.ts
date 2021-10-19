import {IParams} from "../../Interfaces/params";

const exitTrafficDefaultUrl: string = 'https://exitTrafficEmptyUrl___willTakeDefaultUrl.com'
import consola from "consola";
import {getOffer} from '../../Models/offersModel'
import {lidOffer} from "../../Utils/lid"
import {createLidOffer} from "../../Utils/dynamoDb"
import {IOffer} from "../../Interfaces/offers";

export const override = async (params: IParams, offerIdRedirectExitTraffic: number) => {

  const offerExitTraffic: any = await getOffer(offerIdRedirectExitTraffic)
  const offerExitTrafficInfo: IOffer = JSON.parse(offerExitTraffic)

  try {

    params.referredPayIn = Number(params.offerInfo?.payin)
    params.referredPayOut = Number(params.offerInfo?.payout)
    params.referredAdvertiserId = params.offerInfo?.advertiserId || 0
    params.referredAdvertiserName = params.offerInfo?.advertiserName || ''
    params.referredConversionType = params.offerInfo?.conversionType || ''
    params.referredIsCpmOptionEnabled = params.offerInfo?.isCpmOptionEnabled || 0
    params.referredOfferId = params.offerInfo?.offerId || 0
    params.referredVerticalId = params.offerInfo?.verticalId || 0
    params.referredVerticalName = params.offerInfo?.verticalName || ''

    params.landingPageIdOrigin = params.offerInfo?.landingPageId || 0
    params.landingPageUrlOrigin = params.offerInfo?.landingPageUrl || ''
    params.offerIdRedirectExitTraffic = params.offerInfo?.offerIdRedirectExitTraffic || 0

    params.landingPageUrl = offerExitTrafficInfo?.landingPageUrl || exitTrafficDefaultUrl
    params.advertiserId = offerExitTrafficInfo?.advertiserId || 0
    params.advertiserName = offerExitTrafficInfo?.advertiserName || ''
    params.conversionType = offerExitTrafficInfo?.conversionType || ''
    params.isCpmOptionEnabled = offerExitTrafficInfo?.isCpmOptionEnabled || 0
    params.offerId = offerExitTrafficInfo?.offerId || 0
    params.verticalId = offerExitTrafficInfo?.verticalId || 0
    params.verticalName = offerExitTrafficInfo?.verticalName || ''

    params.payin = offerExitTrafficInfo && offerExitTrafficInfo?.payin || 0
    params.payout = offerExitTrafficInfo && offerExitTrafficInfo?.payout || 0

    let lidObj = lidOffer(params)

    await createLidOffer(lidObj)
    params.lidObj = lidObj
  } catch (e) {
    consola.error('override fields error', e)
  }
}

