import {getOffer} from "../../../Models/offersModel";
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {influxdb} from "../../../Utils/metrics";
import {IParams} from "../../../Interfaces/params";
import {IOffer} from "../../../Interfaces/offers";
import {IRedirectType} from "../../../Interfaces/recipeTypes";
import {override} from "../override";

export const capsOfferChecking = async (params: IParams): Promise<boolean> => {
  try {

    if (params.offerInfo?.capInfo?.dateRangeSetUp
      && !params.offerInfo?.capInfo?.dateRangePass
    ) {
      params.capsResult.dataRange = `caps offer data range setup  but not Pass  capInfo:${JSON.stringify(params.offerInfo.capInfo)}`
      params.redirectType = IRedirectType.CAPS_OFFER_DATA_RANGE_NOT_PASS
      params.capsResult.capsType = params.offerInfo?.capInfo?.capsType!
      params.redirectReason = 'offerCapsDataRangeNotPass'
      params.capsResult.info = `offer dateRangeSetUp=${params.offerInfo?.capInfo?.dateRangeSetUp}, dateRangePass=${params.offerInfo?.capInfo?.dateRangePass}`
      return false
    }

    if (
      params.offerInfo?.capInfo?.capsSalesOverLimit
      || params.offerInfo?.capInfo?.capsClicksOverLimit
    ) {

      await override(params, params.offerInfo?.capInfo.offerCapsOfferIdRedirect!)
      params.redirectType = params.offerInfo?.redirectType
      params.redirectReason = params.offerInfo?.redirectReason
      params.capsResult.capsType = params.offerInfo?.capInfo?.capsType!
      params.capsResult.info = `offers caps capsSalesOverLimit=${params.offerInfo?.capInfo?.capsSalesOverLimit}  capsClicksOverLimit=${params.offerInfo?.capInfo?.capsClicksOverLimit}`
    } else if (
      params.offerInfo?.capInfo?.capsSalesUnderLimit
      || params.offerInfo?.capInfo?.capsClicksUnderLimit
    ) {
      params.redirectType = IRedirectType.CAPS_OFFER_UNDER_LIMIT
      params.redirectReason = `offer caps sales or clicks under limit `
      params.capsResult.capsType = params.offerInfo?.capInfo?.capsType!
      params.capsResult.info = `offers caps capsSalesUnderLimit=${params.offerInfo?.capInfo?.capsSalesUnderLimit}, capsClicksUnderLimit=${params.offerInfo?.capInfo?.capsClicksUnderLimit}`
    }

    influxdb(200, `offer_cap_${params.redirectType}`)
    params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
    return true
  } catch (e) {
    consola.error('capsOfferCheckingError:', e)
    return false
  }
}
