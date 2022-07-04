import consola from 'consola';
import { IBestOffer, ICalcAggregatedOffer, ICalculationCache } from '../../../Interfaces/params';
import {
  getAggregatedOffersProportional,
  setAggregatedOffersProportional,
} from '../../../Utils/aggregatedOffersProportional';
import { influxdb } from '../../../Utils/metrics';

export const randomOffer = (offers: number[]): number => {
  const randomId = Math.floor(Math.random() * offers.length);
  return offers[randomId];
};

export const getProportionalOffers = async (campaignId: number, offers: number[]): Promise<IBestOffer> => {
  let calcOfferIdProportionalCache: ICalculationCache | undefined | null = await getAggregatedOffersProportional(campaignId);
  if (!calcOfferIdProportionalCache) {
    influxdb(500, 'aggregated_offers_proportional_use_random_offer_id');
    const randomId = Math.floor(Math.random() * offers.length);
    consola.warn(`[CHOOSE_BEST_OFFER] ** CalcOfferIdProportional is NULL check redis connection, get random bestOffer:${offers[randomId]}`);
    return {
      success: true,
      bestOfferId: randomOffer(offers),
      cacheData: null,
    };
  }
  let calcOfferIdProportional: ICalcAggregatedOffer[] | undefined = calcOfferIdProportionalCache?.data;
  const countOffers = calcOfferIdProportionalCache?.countOffers;
  if (offers.length !== countOffers) {
    consola.warn(`[CHOOSE_BEST_OFFER] ** count by campaign(${campaignId}) for aggregated offers(${offers.length}) and REDIS(${countOffers}) is different, reset redis`);
    influxdb(200, `aggregated_offers_proportional_upd_count_campaign_id_${campaignId}`);

    calcOfferIdProportional = [];
    await setAggregatedOffersProportional(campaignId, calcOfferIdProportional, offers.length);
  }

  for (const id of offers) {
    const checkId = calcOfferIdProportional ? calcOfferIdProportional.filter(
      (i: ICalcAggregatedOffer) => (i.id === id),
    ) : [];
    if (checkId.length === 0) {
      calcOfferIdProportional.push({
        id, count: 0,
      });
      // eslint-disable-next-line no-await-in-loop
      await setAggregatedOffersProportional(campaignId, calcOfferIdProportional, offers.length);
      // eslint-disable-next-line no-await-in-loop
      calcOfferIdProportionalCache = await getAggregatedOffersProportional(campaignId) || [];
      calcOfferIdProportional = calcOfferIdProportionalCache?.data;
      break;
    }
  }

  const [calcOfferIdResponse] = calcOfferIdProportional ? calcOfferIdProportional
    .sort((a: ICalcAggregatedOffer, b: ICalcAggregatedOffer) => a.count - b.count) : [];
  const selectedOfferId = calcOfferIdResponse?.id;
  const currentCount = calcOfferIdResponse?.count;

  consola.info(`[CHOOSE_BEST_OFFER] ** Selected Offer { ${selectedOfferId} } CalcOfferIdProportional from REDIS by campaignId { ${campaignId} }`);
  calcOfferIdProportional?.forEach((i: ICalcAggregatedOffer) => {
    if (i.id === selectedOfferId) {
      // eslint-disable-next-line no-param-reassign
      i.count += 1;
    }
  });
  if (currentCount > Number.MAX_SAFE_INTEGER) {
    influxdb(500, 'aggregated_offers_proportional_huge_count');
    calcOfferIdProportional = [];
  }
  await setAggregatedOffersProportional(campaignId, calcOfferIdProportional!, offers.length);
  return {
    success: true,
    bestOfferId: selectedOfferId,
    cacheData: calcOfferIdProportional,
  };
};
