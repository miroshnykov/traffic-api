import {redirectUrl} from "../../Utils/redirectUrl"
import consola from "consola";
import {IParams} from "../../Interfaces/params";
import {lidOffer} from "../../Utils/lid";
import {createLidOffer} from "../../Utils/dynamoDb";
import {ICustomPayOutPerGeo} from "../../Interfaces/customPayOutPerGeo";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const customPayOutPerGeo = async (params: IParams) => {
  try {
    let pass = false
    let customPayOutPerGeoData: ICustomPayOutPerGeo[] = JSON.parse(params.offerInfo?.customPayOutPerGeo!)
    let checkCustomPerGeo = customPayOutPerGeoData.filter((i: any) => (i.geo === params.country))
    if (checkCustomPerGeo.length > 0) {
      params.customPayOutPerGeo = checkCustomPerGeo[0]

      params.redirectReason = `customPayoutByGeo-${JSON.stringify(checkCustomPerGeo[0])}`
      params.redirectType = IRedirectType.CUSTOM_PAY_OUT_PER_GEO
      params.payout = checkCustomPerGeo[0].payOut
      params.payin = checkCustomPerGeo[0].payIn
      let lidObj = lidOffer(params)
      await createLidOffer(lidObj)
      params.lid = lidObj.lid
      params.lidObj = lidObj

      params.redirectUrl = await redirectUrl(params.landingPageUrl, params)

      pass = true
    }
    return pass
  } catch (e) {
    consola.error('customPayOutPerGeoError:', e)
    return false
  }
}
