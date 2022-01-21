import consola from 'consola';
import { getOffer } from '../../../Models/offersModel';
import { influxdb } from '../../../Utils/metrics';
import { IBaseResponse, IParams } from '../../../Interfaces/params';
import { IOffer } from '../../../Interfaces/offers';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const capsCampaignChecking = async (params: IParams): Promise<IBaseResponse> => {
  const paramsClone = { ...params };
  let pass: boolean = false;
  try {
    if (paramsClone.campaignInfo?.capInfo?.dateRangeSetUp
      && !paramsClone.campaignInfo?.capInfo?.dateRangePass
    ) {
      paramsClone.capsResult.dataRange = `caps campaign data range setup  but not Pass  capInfo:${JSON.stringify(paramsClone.campaignInfo.capInfo)}`;
      paramsClone.redirectType = IRedirectType.CAPS_CAMPAIGN_DATA_RANGE_NOT_PASS;
      paramsClone.capsResult.capsType = IRedirectType.CAPS_CAMPAIGN_DATA_RANGE_NOT_PASS;
      paramsClone.redirectReason = 'capsCampaignDataRangeNotPass';
      paramsClone.capsResult.info = `campaign dateRangeSetUp=${paramsClone.campaignInfo?.capInfo?.dateRangeSetUp}, dateRangePass=${paramsClone.campaignInfo?.capInfo?.dateRangePass} `;
      return {
        success: pass,
        params: paramsClone,
      };
    }

    if (
      paramsClone.campaignInfo?.capInfo?.capsSalesOverLimit
      || paramsClone.campaignInfo?.capInfo?.capsClicksOverLimit
    ) {
      const originOffer: any = await getOffer(paramsClone.offerInfo?.offerIdRedirectExitTraffic!);
      const originOfferInfo: IOffer = JSON.parse(originOffer);

      paramsClone.redirectType = IRedirectType.CAPS_CAMPAIGN_OVER_LIMIT;
      paramsClone.redirectReason = 'caps campaign over limit sales or clicks ';
      paramsClone.capsResult.capsType = IRedirectType.CAPS_CAMPAIGN_OVER_LIMIT;
      // paramsClone.capOverrideOfferId = params.campaignInfo?.originOfferId
      // paramsClone.originAdvertiserId = originOfferInfo?.advertiserId
      // paramsClone.originAdvertiserName = originOfferInfo?.advertiserName
      // paramsClone.originConversionType = originOfferInfo?.conversionType
      // paramsClone.originIsCpmOptionEnabled = originOfferInfo?.isCpmOptionEnabled || 0
      // paramsClone.originOfferId = originOfferInfo?.offerId
      // paramsClone.originVerticalId = originOfferInfo?.verticalId
      // paramsClone.originVerticalName = originOfferInfo?.verticalName
      paramsClone.landingPageUrl = originOfferInfo?.landingPageUrl;
      paramsClone.capsResult.info = `campaign caps, capsSalesOverLimit=${paramsClone.campaignInfo?.capInfo?.capsSalesOverLimit}  capsClicksOverLimit=${paramsClone.campaignInfo?.capInfo?.capsClicksOverLimit}`;
      pass = true;
    } else if (
      paramsClone.campaignInfo?.capInfo?.capsSalesUnderLimit
      || paramsClone.campaignInfo?.capInfo?.capsClicksUnderLimit
    ) {
      const originOffer: any = await getOffer(paramsClone.campaignInfo?.capInfo.campaignCapsOfferIdRedirect!);
      const originOfferInfo: IOffer = JSON.parse(originOffer);

      paramsClone.redirectType = IRedirectType.CAPS_CAMPAIGN_UNDER_LIMIT;
      paramsClone.redirectReason = 'caps campaigns sales or clicks under limit ';
      paramsClone.capsResult.capsType = IRedirectType.CAPS_CAMPAIGN_UNDER_LIMIT;
      paramsClone.landingPageUrl = originOfferInfo?.landingPageUrl;
      paramsClone.capsResult.info = `campaign caps capsSalesUnderLimit=${paramsClone.campaignInfo?.capInfo?.capsSalesUnderLimit}, capsClicksUnderLimit=${params.campaignInfo?.capInfo?.capsClicksUnderLimit}`;
      pass = true;
    }

    influxdb(200, `offer_cap_campaign_${params.redirectType}`);
    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('capsCampaignsCheckingError:', e);
    return {
      success: pass,
      params: paramsClone,
    };
  }
};
