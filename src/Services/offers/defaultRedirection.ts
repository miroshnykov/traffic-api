import consola from "consola";
import {redirectUrl} from "../../Utils/redirectUrl"
import {lidOffer} from "../../Utils/lid"
import {createLidOffer} from "../../Utils/dynamoDb"
import {IParams} from "../../Interfaces/params";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const offersDefaultRedirection = async (params: IParams) => {
  try {
    params.redirectType = IRedirectType.DEFAULT_REDIRECTION
    params.redirectReason = `defaultRedirection-no-rules`

    const lidObj = lidOffer(params)
    await createLidOffer(lidObj)
    params.lid = lidObj.lid
    params.lidObj = lidObj
    params.redirectUrl = await redirectUrl(params.offerInfo.landingPageUrl, params)
    // consola.info(`Info lid { ${params.lid} }`)

    return params
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e)
    throw Error(e)
  }
}

module.exports = {
  offersDefaultRedirection
}