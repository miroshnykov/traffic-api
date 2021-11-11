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
      params.capsResult.dataRange = `caps campaign data range setup  but not Pass  capInfo:${JSON.stringify(params.campaignInfo.capInfo)}`
      params.redirectType = IRedirectType.CAPS_CAMPAIGN_DATA_RANGE_NOT_PASS
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!
      params.redirectReason = 'capsCampaignDataRangeNotPass'
      params.capsResult.info = `campaign dateRangeSetUp=${params.campaignInfo?.capInfo?.dateRangeSetUp}, dateRangePass=${params.campaignInfo?.capInfo?.dateRangePass} `
      return false
    }

    if (
      params.campaignInfo?.capInfo?.capsSalesOverLimit
      || params.campaignInfo?.capInfo?.capsClicksOverLimit
    ) {
      const referredOffer: any = await getOffer(params.offerInfo?.offerIdRedirectExitTraffic!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = IRedirectType.CAPS_CAMPAIGN_OVER_LIMIT
      params.redirectReason = 'caps campaign over limit sales or clicks '
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!
      // params.capOverrideOfferId = params.campaignInfo?.referredOfferId
      // params.referredAdvertiserId = referredOfferInfo?.advertiserId
      // params.referredAdvertiserName = referredOfferInfo?.advertiserName
      // params.referredConversionType = referredOfferInfo?.conversionType
      // params.referredIsCpmOptionEnabled = referredOfferInfo?.isCpmOptionEnabled || 0
      // params.referredOfferId = referredOfferInfo?.offerId
      // params.referredVerticalId = referredOfferInfo?.verticalId
      // params.referredVerticalName = referredOfferInfo?.verticalName
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
      params.capsResult.info = `campaign caps, capsSalesOverLimit=${params.campaignInfo?.capInfo?.capsSalesOverLimit}  capsClicksOverLimit=${params.campaignInfo?.capInfo?.capsClicksOverLimit}`
    } else if (
      params.campaignInfo?.capInfo?.capsSalesUnderLimit
      || params.campaignInfo?.capInfo?.capsClicksUnderLimit
    ) {
      const referredOffer: any = await getOffer(params.campaignInfo?.capInfo.campaignCapsOfferIdRedirect!)
      const referredOfferInfo: IOffer = JSON.parse(referredOffer)

      params.redirectType = IRedirectType.CAPS_CAMPAIGN_UNDER_LIMIT
      params.redirectReason = `caps campaigns sales or clicks under limit `
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!
      params.landingPageUrl = referredOfferInfo?.landingPageUrl
      params.capsResult.info = `campaign caps capsSalesUnderLimit=${params.campaignInfo?.capInfo?.capsSalesUnderLimit}, capsClicksUnderLimit=${params.campaignInfo?.capInfo?.capsClicksUnderLimit}`
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
