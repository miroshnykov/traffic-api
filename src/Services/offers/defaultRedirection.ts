import consola from "consola";
import {redirectUrl} from "../../Utils/redirectUrl"
import {IParams} from "../../Interfaces/params";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const offersDefaultRedirection = async (params: IParams): Promise<IParams> => {
  try {
    params.redirectType = IRedirectType.DEFAULT_REDIRECTION
    params.redirectReason = `defaultRedirection-no-rules`
    params.redirectUrl = await redirectUrl(params.offerInfo.landingPageUrl, params)
    return params
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e)
    throw Error(e)
  }
}