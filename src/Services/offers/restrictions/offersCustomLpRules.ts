import {override} from "../../override/override"
import consola from "consola";
import {customLP} from "../customLp"
import {IParams} from "../../../Interfaces/params";
import {ICustomLP} from "../../../Interfaces/customLPRules";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const offersCustomLpRules = async (params: IParams): Promise<boolean> => {
  let pass: boolean = false
  try {
    let customLPRules = JSON.parse(params.offerInfo.customLpRules)

    let customLPRules_: ICustomLP[] = customLPRules.customLPRules
    let resolveCustomLP = await customLP(params.country, customLPRules_)
    if (resolveCustomLP.length !== 0) {
      params.redirectType = IRedirectType.CUSTOM_LANDING_PAGES
      params.redirectReason = `customLpRules-${JSON.stringify(resolveCustomLP)}`
      await override(params, params.offerInfo.offerIdRedirectExitTraffic)
      params.landingPageUrl = resolveCustomLP[0].lpUrl
      params.isUseDefaultOfferUrl = false
      pass = true
    }
    return pass
  } catch (e) {
    consola.error('offersCustomLpRulesError:', e)
    return pass
  }
}
