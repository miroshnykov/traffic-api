import {Request, Response} from 'express';
import {getOffer} from '../Models/offersModel'
import {getCampaign} from '../Models/campaignsModel'

export const recipeOffersServices = async (id: number) => {
  try {
    let offer = await getOffer(id)
    return offer
  } catch (e) {
    console.log('Service  recipe offer error:', e)
  }

};