import consola from 'consola';
import { override } from '../../override/override';
import { resolveRules } from '../../offers/rulesResolve';
import { IParams } from '../../../Interfaces/params';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

export const campaignsTargetRules = async (params: IParams): Promise<boolean> => {
  try {
    let pass = false;
    const resolveCampaignRules = await resolveRules(params);
    if (resolveCampaignRules.length !== 0) {
      // eslint-disable-next-line no-param-reassign
      params.redirectType = IRedirectType.CAMPAIGN_TARGET_RULES;
      // eslint-disable-next-line no-param-reassign
      params.redirectReason = `campaignTargetRules-${JSON.stringify(resolveCampaignRules)}`;
      await override(params, params.offerInfo.offerIdRedirectExitTraffic);
      pass = true;
    }
    return pass;
  } catch (e) {
    consola.error('campaignsTargetRulesError:', e);
    return false;
  }
};
