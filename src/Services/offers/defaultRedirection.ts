import consola from "consola";
import {redirectUrl} from "../../Utils/redirectUrl"
import {lidOffer} from "../../Utils/lid"
import {createLidOffer} from "../../Utils/dynamoDb"

export const offersDefaultRedirection = async (params: any) => {
  try {
    params.redirectType = 'defaultRedirection'
    params.redirectReason = `defaultRedirection-no-rules`

    let lidObj = lidOffer(params)
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