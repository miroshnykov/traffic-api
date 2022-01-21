import consola from 'consola';
import { override } from '../../override/override';
import { IBaseResponse, IParams } from '../../../Interfaces/params';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const offersStartEndDateSetupCalculations = async (params: IParams): Promise<IBaseResponse> => {
  let paramsOverride: IParams;
  let pass: boolean = false;
  let paramsClone = { ...params };
  try {
    if (!paramsClone.offerInfo.startEndDateSetting.dateRangePass) {
      paramsClone.redirectReason = `Offers not active by date range settings: ${JSON.stringify(paramsClone.offerInfo.startEndDateSetting)}`;
      paramsClone.redirectType = IRedirectType.OFFER_START_END_DATA_RANGE_NOT_PASS;
      paramsOverride = await override(params, params.offerInfo.offerIdRedirectExitTraffic);
      paramsClone = { ...paramsClone, ...paramsOverride };
      pass = true;
    }
    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('offersStartEndDateSetupCalculationsError:', e);
    return {
      success: pass,
      params: paramsClone,
    };
  }
};
