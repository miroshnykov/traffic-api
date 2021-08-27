const exitTrafficDefaultUrl: string = 'https://exitTrafficDefaultUrl.com'
import consola from "consola";
import {getOffer} from '../../Models/offersModel'
import {lidOffer} from "../../Utils/lid"
import {createLidOffer} from "../../Utils/dynamoDb"

export const override = async (params: any, offerIdRedirectExitTraffic: number) => {

  let offerExitTrafficInfo: any = await getOffer(offerIdRedirectExitTraffic)

  try {
    params.referredAdvertiserId = params.offerInfo.advertiserId || 0
    params.referredAdvertiserName = params.offerInfo.advertiserName || 0
    params.referredConversionType = params.offerInfo.conversionType || 0
    params.referredIsCpmOptionEnabled = params.offerInfo.isCpmOptionEnabled || 0
    params.referredOfferId = params.offerInfo.offerId || 0
    params.referredVerticalId = params.offerInfo.verticalId || 0
    params.referredVerticalName = params.offerInfo.verticalName || 0

    params.landingPageUrlOrigin = params.offerInfo.landingPageUrl || 0
    params.offerIdRedirectExitTraffic = params.offerInfo.offerIdRedirectExitTraffic || 0

    params.landingPageUrl = offerExitTrafficInfo?.landingPageUrl || exitTrafficDefaultUrl
    params.advertiserId = offerExitTrafficInfo?.advertiserId || 0
    params.advertiserName = offerExitTrafficInfo?.advertiserName || ''
    params.conversionType = offerExitTrafficInfo?.conversionType || ''
    params.isCpmOptionEnabled = offerExitTrafficInfo?.isCpmOptionEnabled || null
    params.offerId = offerExitTrafficInfo?.offerId || 0
    params.verticalId = offerExitTrafficInfo?.verticalId || 0
    params.verticalName = offerExitTrafficInfo?.verticalName || 0

    let lidObj = lidOffer(params)

    await createLidOffer(lidObj)
    params.lidObj = lidObj
  } catch (e) {
    consola.error('override fields error', e)
  }
}

