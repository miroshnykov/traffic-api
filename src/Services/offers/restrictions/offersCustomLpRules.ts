import {override} from "../override"
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import  {customLP} from "../customLp"

export const offersCustomLpRules = async (params:any) => {
  try {

    let pass = false
    let customLPRules = JSON.parse(params.offerInfo.customLpRules)
    let resolveCustomLP = await customLP(params.country, customLPRules.customLPRules)
    if (resolveCustomLP.length !== 0) {

      params.redirectType = 'customLandingPages'
      params.redirectReason = `customLpRules-${JSON.stringify(resolveCustomLP)}`

      await override(params, params.offerInfo.offerIdRedirectExitTraffic )

      params.redirectUrl = await redirectUrl(resolveCustomLP[0].lpUrl, params)

      pass = true

    }
    return pass

  } catch (e) {
    consola.error('offersCustomLpRulesError:', e)
  }
}
