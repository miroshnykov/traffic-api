import consola from 'consola';
// eslint-disable-next-line import/no-cycle
import { override } from '../override/override';
import { IBestOffer, IBaseResponse, IParams } from '../../Interfaces/params';
import { IAggregatedOfferList } from '../../Interfaces/offers';
import { IRedirectType } from '../../Interfaces/recipeTypes';

import { influxdb } from '../../Utils/metrics';
// eslint-disable-next-line import/no-cycle
import {
  getAggOffersCountByCampaign,
  getAggregatedOffersProportional, setAggOffersCountByCampaign,
  setAggregatedOffersProportional,
} from '../../Utils/aggregatedOffersProportional';

export interface ICalcAggregatedOffer{
  id: number,
  count: number
}

const getProportionalOffers = async (campaignId: number, offers: number[]): Promise<number> => {
  let calcOfferIdProportional: ICalcAggregatedOffer[] | null = await getAggregatedOffersProportional(campaignId);
  if (calcOfferIdProportional === null) {
    influxdb(500, 'aggregated_offers_proportional_use_random_offer_id');
    consola.warn(' ** CalcOfferIdProportional is NULL check redis connection ');
    const randomId = Math.floor(Math.random() * offers.length);
    return offers[randomId];
  }
  // const countOffers = await getAggOffersCountByCampaign(campaignId);
  // if (offers.length !== countOffers) {
  //   await setAggOffersCountByCampaign(campaignId, offers.length);
  //   calcOfferIdProportional = [];
  // }

  for (const id of offers) {
    const checkId = calcOfferIdProportional ? calcOfferIdProportional.filter((i: ICalcAggregatedOffer) => (i.id === id)) : [];
    if (checkId.length === 0) {
      calcOfferIdProportional.push({
        id, count: 0,
      });
      // eslint-disable-next-line no-await-in-loop
      await setAggregatedOffersProportional(campaignId, calcOfferIdProportional);
      // eslint-disable-next-line no-await-in-loop
      calcOfferIdProportional = await getAggregatedOffersProportional(campaignId) || [];
      break;
    }
  }

  const [calcOfferIdResponse] = calcOfferIdProportional ? calcOfferIdProportional.sort((a: ICalcAggregatedOffer, b: ICalcAggregatedOffer) => a.count - b.count) : [];
  const selectedOfferId = calcOfferIdResponse?.id;
  const currentCount = calcOfferIdResponse?.count;

  consola.info(` ** Selected Offer { ${selectedOfferId} } CalcOfferIdProportional from REDIS by campaignId { ${campaignId} } ${JSON.stringify(calcOfferIdProportional)}`);
  calcOfferIdProportional?.forEach((i: ICalcAggregatedOffer) => {
    if (i.id === selectedOfferId) {
      // eslint-disable-next-line no-param-reassign
      i.count += 1;
    }
  });
  if (currentCount > Number.MAX_SAFE_INTEGER) {
    calcOfferIdProportional = [];
  }
  await setAggregatedOffersProportional(campaignId, calcOfferIdProportional!);
  return selectedOfferId;
};

const checkRestrictionsByOffer = (
  offer: IAggregatedOfferList,
  country: string,
): boolean => {
  try {
    return !(offer?.capsOverLimitClicks
      || offer?.capsOverLimitSales
      || offer?.dateRangeNotPass
      || (offer?.countriesRestrictions && offer?.countriesRestrictions.includes(country)));
    // || offer?.customLpCountriesRestrictions && offer?.customLpCountriesRestrictions.includes(params.country))
  } catch (e) {
    consola.error('checkRestrictionsByOffer:', e);
    return false;
  }
};

export const identifyBestOffer = async (
  offersAggregatedIds: IAggregatedOfferList[],
  params: IParams,
): Promise<IBestOffer> => {
  let bestOfferResp: number = 0;
  const paramsClone = { ...params };
  paramsClone.offersAggregatedIds = offersAggregatedIds;
  const offersAggregatedIdsToRedirect: number[] = [];
  for (const offer of offersAggregatedIds) {
    const offerRestrictionPass: boolean = checkRestrictionsByOffer(offer, paramsClone.country);
    if (offerRestrictionPass) {
      offersAggregatedIdsToRedirect.push(+offer.aggregatedOfferId);
    }
  }

  paramsClone.offersAggregatedIdsToRedirect = offersAggregatedIdsToRedirect;

  if (offersAggregatedIdsToRedirect.length !== 0) {
    const randomId = Math.floor(Math.random() * offersAggregatedIdsToRedirect.length);
    // PH-886
    bestOfferResp = offersAggregatedIdsToRedirect[randomId];
    // PH-1112
    // bestOfferResp = await getProportionalOffers(paramsClone.campaignId, offersAggregatedIdsToRedirect);
    // const calcOfferIdProportional = await getAggregatedOffersProportional(paramsClone.campaignId);
    // paramsClone.offersAggregatedIdsProportionals = calcOfferIdProportional.sort((a: ICalcAggregatedOffer, b: ICalcAggregatedOffer) => a.count - b.count);
    // [bestOfferResp] = offersAggregatedIdsToRedirect;

    // PH-38
    // const checkMargin = offersAggregatedIds.filter((i: IAggregatedOfferList) => i.aggregatedOfferId === bestOfferResp)[0];
    // const checkDuplicateMargin = offersAggregatedIds.filter((i: IAggregatedOfferList) => i.margin === checkMargin.margin
    //   && offersAggregatedIdsToRedirect.includes(i.aggregatedOfferId));
    // paramsClone.offersAggregatedIdsMargin = checkDuplicateMargin;
    // if (checkDuplicateMargin.length > 1) {
    //   const duplicateMarginIds = checkDuplicateMargin.map((i: IAggregatedOfferList) => i.aggregatedOfferId);
    //   const randomId = Math.floor(Math.random() * duplicateMarginIds.length);
    //   bestOfferResp = duplicateMarginIds[randomId];
    // }
  }
  return {
    success: true,
    bestOfferId: bestOfferResp,
    params: paramsClone,
  };
};

export const offerAggregatedCalculations = async (
  params: IParams,
): Promise<IBaseResponse> => {
  let paramsClone = { ...params };
  let pass: boolean = false;
  let paramsOverride: IParams;
  try {
    if (paramsClone.offerInfo?.offersAggregatedIds?.length !== 0) {
      paramsClone.groupOffer = true;

      const offersAggregatedIds = paramsClone.offerInfo?.offersAggregatedIds!;

      const bestOfferRes: IBestOffer = await identifyBestOffer(offersAggregatedIds, paramsClone);
      if (bestOfferRes.success && bestOfferRes.bestOfferId) {
        paramsClone.redirectReason = 'Offers Aggregated';
        paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_BEST_OFFER;
        paramsClone.groupBestOffer = bestOfferRes.bestOfferId;
        paramsOverride = await override(paramsClone, bestOfferRes.bestOfferId);
        paramsClone = { ...paramsClone, ...paramsOverride };
        paramsClone.offersAggregatedIdsToRedirect = bestOfferRes?.params?.offersAggregatedIdsToRedirect;
        // paramsClone.offersAggregatedIdsProportionals = bestOfferRes?.params?.offersAggregatedIdsProportionals;
        paramsClone.offersAggregatedIdsMargin = bestOfferRes?.params?.offersAggregatedIdsMargin;
        pass = true;
      } else {
        paramsClone.redirectReason = 'Offers Aggregated exit traffic to regular offer';
        paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_REGULAR_OFFER;
        paramsOverride = await override(paramsClone, paramsClone.offerInfo?.offerIdRedirectExitTraffic);
        paramsClone = { ...paramsClone, ...paramsOverride };
        pass = true;
      }
    }

    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('offerAggregatedCalculationsError:', e);

    return {
      success: pass,
      params: paramsClone,
    };
  }
};
