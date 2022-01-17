import { redis } from '../redis';

export const getOffer = async (id: number) => (redis.get(`offer:${id}`));

export const getOfferSize = async () => (Number(await redis.get('offersSizeTraffic')));
