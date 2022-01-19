import consola from 'consola';
import { IBaseResponse, IParams } from '../../Interfaces/params';
import { IRedirectType } from '../../Interfaces/recipeTypes';

export const offersDefaultRedirection = async (params: IParams): Promise<IBaseResponse> => {
  const paramsClone = { ...params };
  let pass: boolean = false;
  try {
    paramsClone.redirectType = IRedirectType.DEFAULT_REDIRECTION;
    paramsClone.redirectReason = 'defaultRedirection-no-rules';
    pass = true;
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
