import consola from 'consola';
import { IBestOffer, IParams } from '../../Interfaces/params';

import { getOffer } from '../../Models/offersModel';
import { IOffer, IOfferType } from '../../Interfaces/offers';
import { RedirectUrls } from '../../Utils/defaultRedirectUrls';
import { getDefaultOfferUrl, OfferDefault } from '../../Utils/defaultOffer';
import { IRedirectType } from '../../Interfaces/recipeTypes';
// eslint-disable-next-line import/no-cycle
import { influxdb } from '../../Utils/metrics';
import { identifyBestOffer } from '../offers/aggregated/identifyBestOffer';

export const override = async (
  params: IParams,
  offerIdRedirectExitTraffic: number,
): Promise<IParams> => {
  let overrideOfferId = offerIdRedirectExitTraffic;
  if (!offerIdRedirectExitTraffic) {
    consola.error(`Exit traffic does not setup offerType:${params.offerType} for campaign ${params.campaignId} offerId ${params.offerId} will use default ${OfferDefault.OFFER_ID}`);
    influxdb(200, `exit_traffic_empty_for_offer_type_${params.offerType}`);
    overrideOfferId = OfferDefault.OFFER_ID;
  }

  const paramsClone = { ...params };
  const offerExitTraffic: any = await getOffer(overrideOfferId);
  let offerExitTrafficInfo: IOffer = JSON.parse(offerExitTraffic);

  // PH-577
  if (offerExitTrafficInfo.type === IOfferType.AGGREGATED) {
    paramsClone.redirectReason = 'Offers Aggregated exit traffic to aggregatedOffer';
    paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_AGGREGATED_OFFER;
    const exitTrafficBestOfferRes: IBestOffer = await identifyBestOffer(offerExitTrafficInfo?.offersAggregatedIds!, paramsClone);
    if (exitTrafficBestOfferRes.success && exitTrafficBestOfferRes.bestOfferId) {
      influxdb(200, `aggregated_offer_identify_best_offer_in_override_campaign_${paramsClone.campaignId}`);
      const offerExitTrafficBestOffer: any = await getOffer(exitTrafficBestOfferRes.bestOfferId);
      offerExitTrafficInfo = JSON.parse(offerExitTrafficBestOffer);
    } else {
      influxdb(200, `aggregated_offer_default_campaign_${paramsClone.campaignId}`);
      const defaultOffer: any = await getOffer(OfferDefault.OFFER_ID);
      offerExitTrafficInfo = JSON.parse(defaultOffer);
    }
  }

  paramsClone.isExitOffer = true;
  paramsClone.exitOfferInfo = offerExitTrafficInfo;
  paramsClone.originPayIn = Number(paramsClone.offerInfo?.payin);
  paramsClone.originPayOut = Number(paramsClone.offerInfo?.payout);
  paramsClone.originAdvertiserId = paramsClone.offerInfo?.advertiserId || 0;
  paramsClone.originAdvertiserName = paramsClone.offerInfo?.advertiserName || '';
  paramsClone.originConversionType = paramsClone.offerInfo?.conversionType || '';
  paramsClone.originIsCpmOptionEnabled = paramsClone.offerInfo?.isCpmOptionEnabled || 0;
  paramsClone.originOfferId = paramsClone.offerInfo?.offerId || 0;
  paramsClone.originVerticalId = paramsClone.offerInfo?.verticalId || 0;
  paramsClone.originVerticalName = paramsClone.offerInfo?.verticalName || '';

  paramsClone.landingPageIdOrigin = paramsClone.offerInfo?.landingPageId || 0;
  paramsClone.landingPageUrlOrigin = paramsClone.offerInfo?.landingPageUrl || '';
  paramsClone.offerIdRedirectExitTraffic = paramsClone.offerInfo?.offerIdRedirectExitTraffic || 0;

  let landingPageUrl: string;
  if (!offerExitTrafficInfo?.landingPageUrl) {
    landingPageUrl = await getDefaultOfferUrl() || RedirectUrls.DEFAULT;
    paramsClone.isUseDefaultOfferUrl = true;
    consola.info(`exitOfferUrl is empty will use default offer url:${landingPageUrl}`);
    influxdb(500, `exit_offer_url_empty_for_offer_${paramsClone.offerId}_and_campaign_${paramsClone.campaignId}`);
  } else {
    landingPageUrl = offerExitTrafficInfo?.landingPageUrl;
  }
  paramsClone.landingPageUrl = landingPageUrl;
  paramsClone.landingPageId = offerExitTrafficInfo?.landingPageId;
  paramsClone.offerDescription = offerExitTrafficInfo?.descriptions;
  paramsClone.offerName = offerExitTrafficInfo?.name;
  paramsClone.advertiserId = offerExitTrafficInfo?.advertiserId || 0;
  paramsClone.advertiserName = offerExitTrafficInfo?.advertiserName || '';
  paramsClone.conversionType = offerExitTrafficInfo?.conversionType || '';
  paramsClone.isCpmOptionEnabled = offerExitTrafficInfo?.isCpmOptionEnabled || 0;
  paramsClone.offerId = offerExitTrafficInfo?.offerId || 0;
  paramsClone.verticalId = offerExitTrafficInfo?.verticalId || 0;
  paramsClone.verticalName = offerExitTrafficInfo?.verticalName || '';

  paramsClone.payIn = offerExitTrafficInfo?.payin || 0;
  paramsClone.payOut = offerExitTrafficInfo?.payout || 0;
  return paramsClone;
};
