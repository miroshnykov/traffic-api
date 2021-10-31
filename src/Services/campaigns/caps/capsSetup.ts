import {getOffer} from "../../../Models/offersModel";
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {lidOffer} from "../../../Utils/lid"
import {createLidOffer} from "../../../Utils/dynamoDb"
import {influxdb} from "../../../Utils/metrics";
import {IParams} from "../../../Interfaces/params";
import {IOffer} from "../../../Interfaces/offers";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const capsCampaignChecking = async (params: IParams) => {
  try {

    if (params.campaignInfo?.capInfo?.dateRangeSetUp
      && !params.campaignInfo?.capInfo?.dateRangePass
    ) {
      params.dateRangeSetUp = ` Caps Campaign DATA range setup  but not Pass  capInfo:${JSON.stringify(params.campaignInfo.capInfo)}`
      params.redirectType = IRedirectType.CAPS_CAMPAIGNS_DATA_RANGE_NOT_PASS
      params.capsType = params.campaignInfo?.capInfo?.capsType!
      params.redirectReason = 'capsCampaignDataRangeNotPass'
      return false
    }

    if (
      params.campaignInfo?.capInfo?.capsSalesOverLimit
      || params.campaignInfo?.capInfo?.capsClicksOverLimit
    ) {
      const referredOffer: any = await getOffer(params.campaignInfo?.capInfo.campaignCapsOfferIdRedirect!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = IRedirectType.CAPS_CAMPAIGNS_OVER_LIMIT
      params.redirectReason = 'caps campaign over limit sales or clicks '
      params.capsType = params.campaignInfo?.capInfo?.capsType!
      // params.capOverrideOfferId = params.campaignInfo?.referredOfferId
      // params.referredAdvertiserId = referredOfferInfo?.advertiserId
      // params.referredAdvertiserName = referredOfferInfo?.advertiserName
      // params.referredConversionType = referredOfferInfo?.conversionType
      // params.referredIsCpmOptionEnabled = referredOfferInfo?.isCpmOptionEnabled || 0
      // params.referredOfferId = referredOfferInfo?.offerId
      // params.referredVerticalId = referredOfferInfo?.verticalId
      // params.referredVerticalName = referredOfferInfo?.verticalName
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
    } else if (
      params.campaignInfo?.capInfo?.capsSalesUnderLimit
      || params.campaignInfo?.capInfo?.capsClicksUnderLimit
    ) {
      const referredOffer: any = await getOffer(params.offerInfo?.offerIdRedirectExitTraffic!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = IRedirectType.CAPS_CAMPAIGNS_UNDER_LIMIT
      params.redirectReason = `caps campaigns sales or clicks under limit `
      params.capsType = params.campaignInfo?.capInfo?.capsType!
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
    }

    influxdb(200, `offer_cap_campaign_${params.redirectType}`)
    let lidObj = lidOffer(params)
    await createLidOffer(lidObj)
    params.lidObj = lidObj
    params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
    return true
  } catch (e) {
    consola.error('capsCampaignsCheckingError:', e)
    return false
  }
}
