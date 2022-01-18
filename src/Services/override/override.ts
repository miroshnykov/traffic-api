import consola from 'consola';
import {IBestOffer, IParams} from '../../Interfaces/params';

import { getOffer } from '../../Models/offersModel';
import { IOffer, IOfferType } from '../../Interfaces/offers';
import { RedirectUrls } from '../../Utils/defaultRedirectUrls';
import { getDefaultOfferUrl, OfferDefault } from '../../Utils/defaultOffer';
import { IRedirectType } from '../../Interfaces/recipeTypes';
// eslint-disable-next-line import/no-cycle
import { identifyBestOffer } from '../offers/offersAggregated';

export const override = async (
  params: IParams,
  offerIdRedirectExitTraffic: number,
): Promise<IParams> => {
  const overrideOfferId = offerIdRedirectExitTraffic || OfferDefault.OFFER_ID;
  const paramsClone = { ...params };
  const offerExitTraffic: any = await getOffer(overrideOfferId);
  let offerExitTrafficInfo: IOffer = JSON.parse(offerExitTraffic);

  // PH-577
  if (offerExitTrafficInfo.type === IOfferType.AGGREGATED) {
    paramsClone.redirectReason = 'Offers Aggregated exit traffic to aggregatedOffer';
    paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_AGGREGATED_OFFER;
    const exitTrafficBestOfferRes:IBestOffer = identifyBestOffer(offerExitTrafficInfo?.offersAggregatedIds!, params);
    if (exitTrafficBestOfferRes.success && exitTrafficBestOfferRes.bestOfferId) {
      const offerExitTrafficBestOffer: any = await getOffer(exitTrafficBestOfferRes.bestOfferId);
      offerExitTrafficInfo = JSON.parse(offerExitTrafficBestOffer);
    } else {
      const defaultOffer: any = await getOffer(OfferDefault.OFFER_ID);
      offerExitTrafficInfo = JSON.parse(defaultOffer);
    }
  }

  paramsClone.isExitOffer = true;
  paramsClone.exitOfferInfo = offerExitTrafficInfo;
  paramsClone.originPayIn = Number(params.offerInfo?.payin);
  paramsClone.originPayOut = Number(params.offerInfo?.payout);
  paramsClone.originAdvertiserId = params.offerInfo?.advertiserId || 0;
  paramsClone.originAdvertiserName = params.offerInfo?.advertiserName || '';
  paramsClone.originConversionType = params.offerInfo?.conversionType || '';
  paramsClone.originIsCpmOptionEnabled = params.offerInfo?.isCpmOptionEnabled || 0;
  paramsClone.originOfferId = params.offerInfo?.offerId || 0;
  paramsClone.originVerticalId = params.offerInfo?.verticalId || 0;
  paramsClone.originVerticalName = params.offerInfo?.verticalName || '';

  paramsClone.landingPageIdOrigin = params.offerInfo?.landingPageId || 0;
  paramsClone.landingPageUrlOrigin = params.offerInfo?.landingPageUrl || '';
  paramsClone.offerIdRedirectExitTraffic = params.offerInfo?.offerIdRedirectExitTraffic || 0;

  let landingPageUrl: string;
  if (!offerExitTrafficInfo?.landingPageUrl) {
    landingPageUrl = await getDefaultOfferUrl() || RedirectUrls.DEFAULT;
    paramsClone.isUseDefaultOfferUrl = true;
    consola.info(`exitOfferUrl is empty will use default offer url:${landingPageUrl}`);
  } else {
    landingPageUrl = offerExitTrafficInfo?.landingPageUrl;
  }
  paramsClone.landingPageUrl = landingPageUrl;
  paramsClone.landingPageId = offerExitTrafficInfo?.landingPageId;
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
