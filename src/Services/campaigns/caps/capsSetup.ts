import consola from 'consola';
import { getOffer } from '../../../Models/offersModel';
import { influxdb } from '../../../Utils/metrics';
import { IParams } from '../../../Interfaces/params';
import { IOffer } from '../../../Interfaces/offers';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const capsCampaignChecking = async (params: IParams): Promise<boolean> => {
  try {
    if (params.campaignInfo?.capInfo?.dateRangeSetUp
      && !params.campaignInfo?.capInfo?.dateRangePass
    ) {
      params.capsResult.dataRange = `caps campaign data range setup  but not Pass  capInfo:${JSON.stringify(params.campaignInfo.capInfo)}`;
      params.redirectType = IRedirectType.CAPS_CAMPAIGN_DATA_RANGE_NOT_PASS;
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!;
      params.redirectReason = 'capsCampaignDataRangeNotPass';
      params.capsResult.info = `campaign dateRangeSetUp=${params.campaignInfo?.capInfo?.dateRangeSetUp}, dateRangePass=${params.campaignInfo?.capInfo?.dateRangePass} `;
      return false;
    }

    if (
      params.campaignInfo?.capInfo?.capsSalesOverLimit
      || params.campaignInfo?.capInfo?.capsClicksOverLimit
    ) {
      const originOffer: any = await getOffer(params.offerInfo?.offerIdRedirectExitTraffic!);
      const originOfferInfo: IOffer = JSON.parse(originOffer);

      params.redirectType = IRedirectType.CAPS_CAMPAIGN_OVER_LIMIT;
      params.redirectReason = 'caps campaign over limit sales or clicks ';
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!;
      // params.capOverrideOfferId = params.campaignInfo?.originOfferId
      // params.originAdvertiserId = originOfferInfo?.advertiserId
      // params.originAdvertiserName = originOfferInfo?.advertiserName
      // params.originConversionType = originOfferInfo?.conversionType
      // params.originIsCpmOptionEnabled = originOfferInfo?.isCpmOptionEnabled || 0
      // params.originOfferId = originOfferInfo?.offerId
      // params.originVerticalId = originOfferInfo?.verticalId
      // params.originVerticalName = originOfferInfo?.verticalName
      params.landingPageUrl = originOfferInfo?.landingPageUrl;
      params.capsResult.info = `campaign caps, capsSalesOverLimit=${params.campaignInfo?.capInfo?.capsSalesOverLimit}  capsClicksOverLimit=${params.campaignInfo?.capInfo?.capsClicksOverLimit}`;
    } else if (
      params.campaignInfo?.capInfo?.capsSalesUnderLimit
      || params.campaignInfo?.capInfo?.capsClicksUnderLimit
    ) {
      const originOffer: any = await getOffer(params.campaignInfo?.capInfo.campaignCapsOfferIdRedirect!);
      const originOfferInfo: IOffer = JSON.parse(originOffer);

      params.redirectType = IRedirectType.CAPS_CAMPAIGN_UNDER_LIMIT;
      params.redirectReason = 'caps campaigns sales or clicks under limit ';
      params.capsResult.capsType = params.campaignInfo?.capInfo?.capsType!;
      params.landingPageUrl = originOfferInfo?.landingPageUrl;
      params.capsResult.info = `campaign caps capsSalesUnderLimit=${params.campaignInfo?.capInfo?.capsSalesUnderLimit}, capsClicksUnderLimit=${params.campaignInfo?.capInfo?.capsClicksUnderLimit}`;
    }

    influxdb(200, `offer_cap_campaign_${params.redirectType}`);
    return true;
  } catch (e) {
    consola.error('capsCampaignsCheckingError:', e);
    return false;
  }
};
