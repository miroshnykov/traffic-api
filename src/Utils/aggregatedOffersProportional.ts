import { redis } from '../redis';
// eslint-disable-next-line import/no-cycle
import { ICalcAggregatedOffer } from '../Services/offers/offersAggregated';

export const setAggregatedOffersProportional = async (arr: ICalcAggregatedOffer[]) => {
  const format = JSON.stringify(arr);
  await redis.set('aggregatedOffersProportional', format);
};
export const getAggregatedOffersProportional = async () => {
  const response = await redis.get('aggregatedOffersProportional');
  return response ? JSON.parse(response) : [];
};
