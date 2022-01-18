import { getOffer } from '../Models/offersModel';

export const recipeOffersServices = async (id: number) => (getOffer(id));
