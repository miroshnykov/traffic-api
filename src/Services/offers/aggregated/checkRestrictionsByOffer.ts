import consola from 'consola';
import { IAggregatedOfferList } from '../../../Interfaces/offers';

export const checkRestrictionsByOffer = (
  offer: IAggregatedOfferList,
  country: string,
): boolean => {
  try {
    return !(offer?.capsOverLimitClicks
      || offer?.capsOverLimitSales
      || offer?.dateRangeNotPass
      || (offer?.countriesRestrictions && offer?.countriesRestrictions.includes(country)));
    // || offer?.customLpCountriesRestrictions && offer?.customLpCountriesRestrictions.includes(params.country))
  } catch (e) {
    consola.error('checkRestrictionsByOffer:', e);
    return false;
  }
};
