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
