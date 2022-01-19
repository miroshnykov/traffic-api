import consola from 'consola';
import { override } from '../../override/override';
import { IBaseResponse, IParams } from '../../../Interfaces/params';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const offersGeoRestrictions = async (params: IParams): Promise<IBaseResponse> => {
  let pass: boolean = false;
  let paramsOverride:IParams;
  let paramsClone = { ...params };
  try {
    if (paramsClone.offerInfo?.countriesRestrictions?.includes(paramsClone.country)) {
      paramsClone.redirectReason = `geoRestriction by country:${paramsClone.country}`;
      paramsClone.redirectType = IRedirectType.OFFER_GEO_RESTRICTION;
      paramsOverride = await override(paramsClone, paramsClone.offerInfo.offerIdRedirectExitTraffic);
      paramsClone = { ...paramsClone, ...paramsOverride };
      pass = true;
    }
    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e);
    return {
      success: pass,
      params: paramsClone,
    };
  }
};
