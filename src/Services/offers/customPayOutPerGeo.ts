import {override} from "./override"
import {redirectUrl} from "../../Utils/redirectUrl"
import consola from "consola";
import {IParams} from "../../Interfaces/params";

export const customPayOutPerGeo = (params:IParams) => {
  try {
    let pass = false
    let customPayOutPerGeoData = JSON.parse(params.offerInfo?.customPayOutPerGeo!)
    let checkCustomPerGeo = customPayOutPerGeoData.filter((i: any) => (i.geo === params.country))
    if (checkCustomPerGeo.length > 0) {
      params.customPayOutPerGeo = checkCustomPerGeo
      pass = true
    }
    return pass
  } catch (e) {
    consola.error('customPayOutPerGeoError:', e)
  }
}
