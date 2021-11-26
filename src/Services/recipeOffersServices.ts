import {getOffer} from '../Models/offersModel'

export const recipeOffersServices = async (id: number) => {
  try {
    let offer = await getOffer(id)
    return offer
  } catch (e) {
    console.log('Service  recipe offer error:', e)
  }

};