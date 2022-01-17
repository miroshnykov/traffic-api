import consola from 'consola';
import { override } from '../../override/override';
import { customLP } from '../customLp';
import { IBaseResponse, IParams } from '../../../Interfaces/params';
import { ICustomLP } from '../../../Interfaces/customLPRules';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const offersCustomLpRules = async (params: IParams): Promise<IBaseResponse> => {
  let pass: boolean = false;
  let paramsOverride:IParams;
  let paramsClone = { ...params };
  try {
    const customLPRules = JSON.parse(paramsClone.offerInfo.customLpRules);

    const customLPRulesFormat: ICustomLP[] = customLPRules.customLPRules;
    const resolveCustomLP = await customLP(paramsClone.country, customLPRulesFormat);
    if (resolveCustomLP.length !== 0) {
      paramsClone.redirectType = IRedirectType.CUSTOM_LANDING_PAGES;
      paramsClone.redirectReason = `customLpRules-${JSON.stringify(resolveCustomLP)}`;
      await override(paramsClone, paramsClone.offerInfo.offerIdRedirectExitTraffic);
      paramsOverride = await override(paramsClone, paramsClone.offerInfo.offerIdRedirectExitTraffic);
      paramsClone = { ...paramsClone, ...paramsOverride };
      paramsClone.landingPageUrl = resolveCustomLP[0].lpUrl;
      paramsClone.isUseDefaultOfferUrl = false;
      pass = true;
    }
    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('offersCustomLpRulesError:', e);
    return {
      success: pass,
      params: paramsClone,
    };
  }
};
