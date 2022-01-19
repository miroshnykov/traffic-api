import consola from 'consola';
import { IParams, IResponse } from '../../Interfaces/params';
import { IOffer } from '../../Interfaces/offers';
import { IRedirectType } from '../../Interfaces/recipeTypes';
import { ICustomPayOutPerGeo } from '../../Interfaces/customPayOutPerGeo';
import { influxdb } from '../../Utils/metrics';

export const exitOfferNested = (
  params: IParams,
  exitOfferDetected: IOffer,
): IParams => {
  const paramsClone = { ...params };
  if (Object.keys(exitOfferDetected).length === 0) {
    return paramsClone;
  }
  influxdb(200, 'offer_exit_nested');
  const exitOffersNestedArr: IOffer[] = paramsClone?.offerInfo?.exitOffersNested || [];
  const lengthNestedExitOffer: number = paramsClone?.offerInfo?.exitOffersNested?.length || 0;

  const exitTrafficFilter = exitOffersNestedArr.filter((i) => i.capInfo?.isExitTraffic);
  exitTrafficFilter.push(exitOfferDetected);
  const stepsNestedOffers = `${paramsClone?.offerInfo?.offerId},${exitTrafficFilter.map((i) => i.offerId).join(',')}`;

  const tmpOriginUrl = paramsClone.landingPageUrl;
  paramsClone.landingPageUrl = exitOfferDetected?.landingPageUrl;
  paramsClone.advertiserId = exitOfferDetected?.advertiserId || 0;
  paramsClone.advertiserName = exitOfferDetected?.advertiserName || '';
  paramsClone.conversionType = exitOfferDetected?.conversionType || '';
  paramsClone.isCpmOptionEnabled = exitOfferDetected?.isCpmOptionEnabled || 0;
  paramsClone.offerId = exitOfferDetected?.offerId || 0;
  paramsClone.verticalId = exitOfferDetected?.verticalId || 0;
  paramsClone.verticalName = exitOfferDetected?.verticalName || '';
  paramsClone.payIn = exitOfferDetected?.payin || 0;
  paramsClone.payOut = exitOfferDetected?.payout || 0;
  paramsClone.exitOfferResult.type = IRedirectType.EXIT_OFFER_NESTED;
  paramsClone.exitOfferResult.info = ` -> Additional override by exitOfferId:${exitOfferDetected?.offerId}, total nested offer:${lengthNestedExitOffer}`;
  paramsClone.exitOfferResult.steps = stepsNestedOffers;
  consola.info(` -> Additional override by { exitOfferNested } lid { ${paramsClone.lid} } origin LP:{ ${tmpOriginUrl} }, override LP: { ${exitOfferDetected.landingPageUrl} }`);
  return paramsClone;
};

export const exitOfferCustomPayout = (params: IParams, handleConditionsResponse: IResponse): IParams => {
  const exitOfferCustomPayOutPerGeoData: ICustomPayOutPerGeo[] = JSON.parse(handleConditionsResponse?.params?.exitOfferInfo?.customPayOutPerGeo!);
  const [checkExitOfferCustomPerGeo] = exitOfferCustomPayOutPerGeoData.filter((i: any) => (i.geo === params.country));
  // consola.info('checkExitOfferCustomPerGeo:', checkExitOfferCustomPerGeo);
  const paramsClone = { ...params };
  if (checkExitOfferCustomPerGeo) {
    influxdb(200, 'offer_exit_custom_pay_out_per_geo');
    paramsClone.payOut = checkExitOfferCustomPerGeo.payOut;
    paramsClone.payIn = checkExitOfferCustomPerGeo.payIn;
    paramsClone.exitOfferResult.type = IRedirectType.EXIT_OFFER_CUSTOM_PAY_OUT_PER_GEO;
    paramsClone.exitOfferResult.info = handleConditionsResponse?.params?.exitOfferInfo?.customPayOutPerGeo!;
    consola.info(` -> Additional override by { exitOfferCustomPayout } payIn { ${paramsClone.payIn}, payOut { ${paramsClone.payOut} }  lid { ${params.lid} }`);
  }
  return paramsClone;
};
