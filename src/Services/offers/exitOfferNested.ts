import {IParams, IResponse} from "../../Interfaces/params";
import consola from "consola";
import {IOffer} from "../../Interfaces/offers";
import {IRedirectType} from "../../Interfaces/recipeTypes";
import {ICustomPayOutPerGeo} from "../../Interfaces/customPayOutPerGeo";
import {influxdb} from "../../Utils/metrics";
import {redirectUrl} from "../../Utils/redirectUrl";

export const exitOfferNested = async (
  params: IParams,
  exitOfferDetected: IOffer
): Promise<void> => {
  try {

    if (Object.keys(exitOfferDetected).length === 0) {
      return
    }
    influxdb(200, 'offer_exit_nested')
    const exitOffersNestedArr: IOffer[] = params?.offerInfo?.exitOffersNested || []
    const lengthNestedExitOffer: number = params?.offerInfo?.exitOffersNested?.length || 0

    const exitTrafficFilter = exitOffersNestedArr.filter(i => i.capInfo?.isExitTraffic)
    exitTrafficFilter.push(exitOfferDetected)
    const stepsNestedOffers = params?.offerInfo?.offerId + ',' + exitTrafficFilter.map(i => i.offerId).join(',')

    const tmpOriginUrl = params.landingPageUrl
    params.landingPageUrl = exitOfferDetected?.landingPageUrl
    params.advertiserId = exitOfferDetected?.advertiserId || 0
    params.advertiserName = exitOfferDetected?.advertiserName || ''
    params.conversionType = exitOfferDetected?.conversionType || ''
    params.isCpmOptionEnabled = exitOfferDetected?.isCpmOptionEnabled || 0
    params.offerId = exitOfferDetected?.offerId || 0
    params.verticalId = exitOfferDetected?.verticalId || 0
    params.verticalName = exitOfferDetected?.verticalName || ''
    params.payin = exitOfferDetected?.payin || 0
    params.payout = exitOfferDetected?.payout || 0
    params.exitOfferResult.type = IRedirectType.EXIT_OFFER_NESTED
    params.exitOfferResult.info = ` -> Additional override by exitOfferId:${exitOfferDetected?.offerId}, total nested offer:${lengthNestedExitOffer}`
    params.exitOfferResult.steps = stepsNestedOffers
    params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
    consola.info(` -> Additional override by { exitOfferNested } lid { ${params.lid} } origin LP:${tmpOriginUrl}, override LP:${params.landingPageUrl}`)

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
