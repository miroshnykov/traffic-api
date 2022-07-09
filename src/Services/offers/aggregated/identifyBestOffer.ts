import consola from 'consola';
import { IAggregatedOfferList } from '../../../Interfaces/offers';
import { IBestOffer, ICalcAggregatedOffer, IParams } from '../../../Interfaces/params';
import { influxdb } from '../../../Utils/metrics';
import { checkRestrictionsByOffer } from './checkRestrictionsByOffer';
import { getProportionalOffers, randomOffer } from './getProportionalOffers';

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
    // const randomId = Math.floor(Math.random() * offersAggregatedIdsToRedirect.length);
    // PH-886
    // bestOfferResp = offersAggregatedIdsToRedirect[randomId];
    // PH-1112
    const proportionalOffersResp: IBestOffer = await getProportionalOffers(
      paramsClone.campaignId, offersAggregatedIdsToRedirect,
    );
    bestOfferResp = proportionalOffersResp?.bestOfferId;
    if (!bestOfferResp) {
      consola.error(`[CHOOSE_BEST_OFFER] bestOffer for campaignId ${paramsClone.campaignId} did not defined for some reason use random offer`);
      influxdb(500, 'aggregated_offers_proportional_null_use_random_offer_id');
      bestOfferResp = randomOffer(offersAggregatedIdsToRedirect);
    }

    const calcOfferIdProportional = proportionalOffersResp?.cacheData;
    if (calcOfferIdProportional) {
      paramsClone.offersAggregatedIdsProportionals = calcOfferIdProportional
        .sort((a: ICalcAggregatedOffer, b: ICalcAggregatedOffer) => a.count - b.count);
    }

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
    success: !!bestOfferResp,
    bestOfferId: bestOfferResp,
    params: paramsClone,
  };
};
