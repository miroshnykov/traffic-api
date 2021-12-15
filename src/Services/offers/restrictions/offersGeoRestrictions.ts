import {override} from "../../override/override"
import consola from "consola";
import {IParams} from "../../../Interfaces/params";
import {IRedirectType} from "../../../Interfaces/recipeTypes";

export const offersGeoRestrictions = async (params: IParams): Promise<boolean> => {
  let pass: boolean = false
  try {
    if (params.offerInfo?.countriesRestrictions?.includes(params.country)) {
      params.redirectReason = `geoRestriction by country:${params.country}`
      params.redirectType = IRedirectType.OFFER_GEO_RESTRICTION
      await override(params, params.offerInfo.offerIdRedirectExitTraffic)
      pass = true
    }
    return pass
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e)
    return pass
  }
}
