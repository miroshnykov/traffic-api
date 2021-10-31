import {getOffer} from "../../../Models/offersModel";
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {lidOffer} from "../../../Utils/lid"
import {createLidOffer} from "../../../Utils/dynamoDb"
import {influxdb} from "../../../Utils/metrics";
import {IParams} from "../../../Interfaces/params";
import {IOffer} from "../../../Interfaces/offers";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const capsChecking = async (params: IParams) => {
  try {

    if (params.offerInfo?.capInfo?.dateRangeSetUp
      && !params.offerInfo?.capInfo?.dateRangePass
    ) {
      params.dateRangeSetUp = ` Caps DATA range setup  but not Pass  capInfo:${JSON.stringify(params.offerInfo.capInfo)}`
      params.redirectType = IRedirectType.CAPS_DATA_RANGE_NOT_PASS
      params.capsType = params.offerInfo?.capInfo?.capsType!
      params.redirectReason = 'capsDataRangeNotPass'
      return false
    }

    if (
      params.offerInfo?.capInfo?.capsSalesOverLimit
      || params.offerInfo?.capInfo?.capsClicksOverLimit
    ) {
      const referredOffer: any = await getOffer(params.offerInfo?.referredOfferId!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = params.offerInfo?.redirectType
      params.redirectReason = params.offerInfo?.redirectReason
      params.capsType = params.offerInfo?.capInfo?.capsType!
      params.capOverrideOfferId = params.offerInfo?.referredOfferId
      params.referredAdvertiserId = referredOfferInfo?.advertiserId
      params.referredAdvertiserName = referredOfferInfo?.advertiserName
      params.referredConversionType = referredOfferInfo?.conversionType
      params.referredIsCpmOptionEnabled = referredOfferInfo?.isCpmOptionEnabled || 0
      params.referredOfferId = referredOfferInfo?.offerId
      params.referredVerticalId = referredOfferInfo?.verticalId
      params.referredVerticalName = referredOfferInfo?.verticalName
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
    } else if (
      params.offerInfo?.capInfo?.capsSalesUnderLimit
      || params.offerInfo?.capInfo?.capsClicksUnderLimit
    ) {
      params.redirectType = IRedirectType.CAPS_UNDER_LIMIT
      params.redirectReason = `caps sales or clicks under limit `
      params.capsType = params.offerInfo?.capInfo?.capsType!
    }

    influxdb(200, `offer_cap_${params.redirectType}`)
    let lidObj = lidOffer(params)
    await createLidOffer(lidObj)
    params.lidObj = lidObj
    params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
    return true
  } catch (e) {
    consola.error('capsCheckingError:', e)
    return false
  }
}
