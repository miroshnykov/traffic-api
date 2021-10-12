import {redis} from "../redis";
import consola from "consola";

export const getOffer = async (id: number) => {
  try {
    return await redis.get(`offer_${id}`)
  } catch (e) {
    consola.error('Get offer Model error:', e)
  }
};

export const getOfferSize = async () => {
  try {
    return Number(await redis.get(`offersSize_`))
  } catch (e) {
    consola.error('Get offer Model error:', e)
  }
};
