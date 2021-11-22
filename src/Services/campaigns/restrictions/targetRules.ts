import {override} from "../../offers/override"
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {resolveRules} from "../../offers/rulesResolve"
import {IParams} from "../../../Interfaces/params";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const campaignsTargetRules = async (params: IParams): Promise<boolean> => {
  try {
    let pass = false
    let resolveCampaignRules = await resolveRules(params)
    if (resolveCampaignRules.length !== 0) {
      params.redirectType = IRedirectType.CAMPAIGN_TARGET_RULES
      params.redirectReason = `campaignTargetRules-${JSON.stringify(resolveCampaignRules)}`
      await override(params, params.offerInfo.offerIdRedirectExitTraffic)
      params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
      pass = true
    }
    return pass
  } catch (e) {
    consola.error('campaignsTargetRulesError:', e)
    return false
  }
}
