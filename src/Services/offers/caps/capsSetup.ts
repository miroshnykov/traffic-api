import {getOffer} from "../../../Models/offersModel";
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {lidOffer} from "../../../Utils/lid"
import {createLidOffer} from "../../../Utils/dynamoDb"
import {influxdb} from "../../../Utils/metrics";
import {IParams} from "../../../Interfaces/params";
import {IOffer} from "../../../Interfaces/offers";

export const capsChecking = async (params: IParams) => {
  let pass = false
  try {
    params.capSetup = true

    if (params.offerInfo?.capInfo?.dateRangeSetUp
      && !params.offerInfo?.capInfo?.dateRangePass
    ) {
      params.dateRangeSetUp = ` Caps DATA range setup  but not Pass  capInfo:${JSON.stringify(params.offerInfo.capInfo)}`
      params.capsType = 'CapsDataRangeNotPass'
      params.redirectType = 'CapsDataRangeNotPass'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }

    if (params.offerInfo?.capInfo?.capsSalesOverLimit
      || params.offerInfo?.capInfo?.capsClicksOverLimit
    ) {

      const referredOffer: any = await getOffer(params.offerInfo?.referredOfferId!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = params.offerInfo?.redirectType
      params.redirectReason = params.offerInfo?.redirectReason
      params.capOverrideOfferId = params.offerInfo?.referredOfferId
      params.referredAdvertiserId = referredOfferInfo?.advertiserId
      params.referredAdvertiserName = referredOfferInfo?.advertiserName
      params.referredConversionType = referredOfferInfo?.conversionType
      params.referredIsCpmOptionEnabled = referredOfferInfo?.isCpmOptionEnabled || 0
      params.referredOfferId = referredOfferInfo?.offerId
      params.referredVerticalId = referredOfferInfo?.verticalId
      params.referredVerticalName = referredOfferInfo?.verticalName
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
    }

    if (params.offerInfo?.capInfo?.capsClicksUnderLimit) {
      params.redirectType = 'capsClicksUnderLimit'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }

    if (params.offerInfo?.capInfo?.capsSalesUnderLimit) {
      params.redirectType = 'capsSalesUnderLimit'
      params.redirectReason = 'useDefaultOfferLandingPage'
    }
    influxdb(200, `offer_cap_${params.redirectType}`)
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
