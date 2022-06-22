import { redis } from '../redis';
// eslint-disable-next-line import/no-cycle
import { ICalcAggregatedOffer } from '../Services/offers/offersAggregated';

export const setAggregatedOffersProportional = async (campaignId: number, arr: ICalcAggregatedOffer[]) => {
  const format = JSON.stringify(arr);
  await redis.set(`aggregatedOffersProportional:${campaignId}`, format);
};

export const getAggregatedOffersProportional = async (campaignId: number) => {
  const response = await redis.get(`aggregatedOffersProportional:${campaignId}`);
  return response ? JSON.parse(response) : [];
};

export const setAggOffersCountByCampaign = async (campaignId: number, count: number) => {
  await redis.set(`aggregatedOffersCount:${campaignId}`, count);
};

export const getAggOffersCountByCampaign = async (campaignId: number) => {
  const resp = await redis.get(`aggregatedOffersCount:${campaignId}`);
  return Number(resp);
};
