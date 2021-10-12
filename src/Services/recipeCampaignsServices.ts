import consola from "consola";
import {getCampaign} from '../Models/campaignsModel'

export const recipeCampaignsServices = async (id: number) => {
  try {
    return await getCampaign(id)

  } catch (e) {
    consola.error('recipeCampaignsServices error:', e)
  }

};