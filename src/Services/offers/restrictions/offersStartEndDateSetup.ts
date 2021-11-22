import {override} from "../override"
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {IParams} from "../../../Interfaces/params";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const offersStartEndDateSetupCalculations = async (params: IParams): Promise<boolean> => {
  try {
    let pass = false
    if (!params.offerInfo.startEndDateSetting.dateRangePass) {
      params.redirectReason = `Offers not active by date range settings: ${JSON.stringify(params.offerInfo.startEndDateSetting)}`
      params.redirectType = IRedirectType.OFFER_START_END_DATA_RANGE_NOT_PASS
      await override(params, params.offerInfo.offerIdRedirectExitTraffic)

      params.redirectUrl = await redirectUrl(params.landingPageUrl, params)

      pass = true
    }
    return pass

  } catch (e) {
    consola.error('offersStartEndDateSetupCalculationsError:', e)
    return false
  }
}
