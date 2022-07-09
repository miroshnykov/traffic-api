import consola from 'consola';
import { redis } from '../redis';
import { ICalcAggregatedOffer } from '../Interfaces/params';
import { influxdb } from './metrics';

export const setAggregatedOffersProportional = async (
  campaignId: number,
  aggregatedOffersData: ICalcAggregatedOffer[],
  countOffers: number,
) => {
  const cache = {
    countOffers,
    data: aggregatedOffersData,
  };
  const format = JSON.stringify(cache);
  await redis.set(`aggregatedOffersProportional:${campaignId}`, format);
};

export const getAggregatedOffersProportional = async (campaignId: number) => {
  try {
    const response = await redis.get(`aggregatedOffersProportional:${campaignId}`);
    return response ? JSON.parse(response) : [];
  } catch (e) {
    consola.error('getAggregatedOffersProportionalErrors:', e);
    influxdb(500, 'aggregated_offers_proportional_redis_error');
    return null;
  }
};

// export const setAggOffersCountByCampaign = async (campaignId: number, count: number) => {
//   await redis.set(`aggregatedOffersCount:${campaignId}`, count);
// };
//
// export const getAggOffersCountByCampaign = async (campaignId: number) => {
//   const resp = await redis.get(`aggregatedOffersCount:${campaignId}`);
//   return Number(resp);
// };
