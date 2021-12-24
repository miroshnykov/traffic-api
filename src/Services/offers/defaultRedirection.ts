import consola from "consola";
import {IParams} from "../../Interfaces/params";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const offersDefaultRedirection = async (params: IParams): Promise<IParams> => {
  try {
    params.redirectType = IRedirectType.DEFAULT_REDIRECTION
    params.redirectReason = `defaultRedirection-no-rules`
    return params
  } catch (e) {
    consola.error('offersGeoRestrictionsError:', e)
    throw Error(e)
  }
}