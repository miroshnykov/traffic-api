import {redis} from "../redis";
import consola from "consola";

export const getCampaign = async (id: number) => {
  try {
    return await redis.get(`campaign_${id}`)
  } catch (e) {
    consola.error('getCampaign error:', e)
  }
};

export const getCampaignSize = async () => {
  try {
    return Number(await redis.get(`campaignsSize_`))
  } catch (e) {
    consola.error('getCampaignSize error:', e)
  }
};
