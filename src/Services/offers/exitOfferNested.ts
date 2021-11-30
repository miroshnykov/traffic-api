import {IParams, IResponse} from "../../Interfaces/params";
import consola from "consola";
import {IOffer} from "../../Interfaces/offers";
import {IRedirectType} from "../../Interfaces/recipeTypes";
import {ICustomPayOutPerGeo} from "../../Interfaces/customPayOutPerGeo";
import {influxdb} from "../../Utils/metrics";

export const exitOfferNested = (params: IParams, exitOffer: IOffer, lengthNestedExitOffer: number): void => {
  try {
    influxdb(200, 'offer_exit_nested')
    params.landingPageUrl = exitOffer?.landingPageUrl
    params.advertiserId = exitOffer?.advertiserId || 0
    params.advertiserName = exitOffer?.advertiserName || ''
    params.conversionType = exitOffer?.conversionType || ''
    params.isCpmOptionEnabled = exitOffer?.isCpmOptionEnabled || 0
    params.offerId = exitOffer?.offerId || 0
    params.verticalId = exitOffer?.verticalId || 0
    params.verticalName = exitOffer?.verticalName || ''
    params.payin = exitOffer?.payin || 0
    params.payout = exitOffer?.payout || 0
    params.exitOfferResult.type = IRedirectType.EXIT_OFFER_NESTED
    params.exitOfferResult.info = ` -> Additional override by exitOfferId:${exitOffer?.offerId}, total nested offer:${lengthNestedExitOffer}`
    consola.info(` -> Additional override by { exitOfferNested } lid { ${params.lid} }`)

  } catch (e) {
    consola.error('exitOfferNestedError:', e)
  }
}

export const exitOfferCustomPayout = (params: IParams, handleConditionsResponse: IResponse): void => {
  try {
    const exitOfferCustomPayOutPerGeoData: ICustomPayOutPerGeo[] = JSON.parse(handleConditionsResponse?.data?.exitOfferInfo?.customPayOutPerGeo!)
    const checkExitOfferCustomPerGeo = exitOfferCustomPayOutPerGeoData.filter((i: any) => (i.geo === params.country))
    if (checkExitOfferCustomPerGeo.length > 0) {
      influxdb(200, 'offer_exit_custom_pay_out_per_geo')
      params.payout = checkExitOfferCustomPerGeo[0].payOut
      params.payin = checkExitOfferCustomPerGeo[0].payIn
      params.exitOfferResult.type = IRedirectType.EXIT_OFFER_CUSTOM_PAY_OUT_PER_GEO
      params.exitOfferResult.info = handleConditionsResponse?.data?.exitOfferInfo?.customPayOutPerGeo!
      consola.info(` -> Additional override by { exitOfferCustomPayout } lid { ${params.lid} }`)
    }
  } catch (e) {
    consola.error('exitOfferCustomPayoutError:', e)
  }
}
