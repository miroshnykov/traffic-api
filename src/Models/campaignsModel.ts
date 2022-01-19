import { redis } from '../redis';

export const getCampaign = async (id: number) => (redis.get(`campaign:${id}`));

export const getCampaignSize = async () => (Number(await redis.get('campaignsSizeTraffic')));
