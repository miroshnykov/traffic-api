import {override} from "../override"
import {redirectUrl} from "../../../Utils/redirectUrl"
import consola from "consola";
import {geoRestrictions} from "../geoRestrictions"
import {IParams} from "../../../Interfaces/params";

export const offersGeoRestrictions = async (params: IParams) => {
  try {
    let pass = false
    let geoRules = JSON.parse(params.offerInfo.geoRules)
    params.geoRules = geoRules
    let resolveGeo = await geoRestrictions(params.country, geoRules.geo)
    if (resolveGeo.length !== 0) {
      params.redirectReason = `geoRestriction by country:${JSON.stringify(resolveGeo)}`
      params.redirectType = 'offerGeoRestriction'

      await override(params, params.offerInfo.offerIdRedirectExitTraffic)
      params.redirectUrl = await redirectUrl(params.landingPageUrl, params)

      pass = true

    }
    return pass
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e)
  }
}
