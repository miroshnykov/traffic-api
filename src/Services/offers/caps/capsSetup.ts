import {getOffer} from "../../../Models/offersModel";
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {lidOffer} from "../../../Utils/lid"
import {createLidOffer} from "../../../Utils/dynamoDb"

export const capsChecking = async (params: any) => {
  let pass = false
  try {
    params.capSetup = true

    if (params.offerInfo.capInfo.dateRangeSetUp && !params.offerInfo.capInfo.dateRangePass) {
      params.dateRangeSetUp = ` Caps DATA range setup  but not Pass  capInfo:${JSON.stringify(params.offerInfo.capInfo)}`
      params.capsType = 'CapsDataRangeNotPass'
      params.redirectType = 'CapsDataRangeNotPass'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }

    if (params.offerInfo.capsSalesOverLimit || params.offerInfo.capsClicksOverLimit) {

      const referredOffer: any = await getOffer(params.offerInfo.referredOfferId)
      const referredOfferInfo: any = JSON.parse(referredOffer)

      params.redirectType = params.offerInfo?.redirectType || null
      params.redirectReason = params.offerInfo?.redirectReason || null
      params.referredAdvertiserId = referredOfferInfo?.advertiserId || null
      params.referredAdvertiserName = referredOfferInfo?.advertiserName || null
      params.referredConversionType = referredOfferInfo?.conversionType || null
      params.referredIsCpmOptionEnabled = referredOfferInfo?.isCpmOptionEnabled || 0
      params.referredOfferId = referredOfferInfo?.offerId || null
      params.referredVerticalId = referredOfferInfo?.verticalId || null
      params.referredVerticalName = referredOfferInfo?.verticalName || null
      params.landingPageUrl = referredOfferInfo?.landingPageUrl || null
    }
    if (params.offerInfo.capsClicksUnderLimit) {
      params.redirectType = 'capsClicksUnderLimit'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }
    if (params.offerInfo.capsSalesUnderLimit) {
      params.redirectType = 'capsSalesUnderLimit'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }

    let lidObj = lidOffer(params)
    await createLidOffer(lidObj)
    params.lidObj = lidObj
    params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
    pass = true
    return pass
  } catch (e) {
    consola.error('capsCheckingError:', e)
  }
}
