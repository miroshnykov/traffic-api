import consola from 'consola';
import { IBaseResponse, IParams } from '../../Interfaces/params';
import { customPayOutPerGeo } from '../offers/customPayOutPerGeo';
import { influxdb } from '../../Utils/metrics';
import { exitOfferCustomPayout, exitOfferNested } from '../offers/exitOfferNested';
import { IOffer } from '../../Interfaces/offers';

export const exitOfferOverride = (params: IParams): IParams => {
  let paramsClone = { ...params };
  // PH-459
  if ((paramsClone?.offerInfo?.capInfo?.capsSalesUnderLimit
      || paramsClone?.offerInfo?.capInfo?.capsClicksUnderLimit)
    && paramsClone?.offerInfo?.customPayOutPerGeo) {
    const customPayOutPerGeoRes:IBaseResponse = customPayOutPerGeo(paramsClone);
    if (customPayOutPerGeoRes.success) {
      paramsClone = { ...paramsClone, ...customPayOutPerGeoRes.params };
      influxdb(200, 'offer_custom_pay_out_per_geo_caps_under_limit');
      consola.info(` -> additional override Redirect type { offer customPayOutPerGeo CapsUnderLimit } lid { ${paramsClone?.lid} }`);
    }
  }

  if (paramsClone?.isExitOffer) {
    // PH-426
    if (paramsClone?.exitOfferInfo?.customPayOutPerGeo!) {
      const exitOfferCustomPayoutRes = exitOfferCustomPayout(paramsClone);
      if (exitOfferCustomPayoutRes.success) {
        paramsClone = { ...paramsClone, ...exitOfferCustomPayoutRes.params };
      }
    }
  }

  // PH-428
  if (paramsClone?.offerInfo?.exitOfferDetected) {
    const exitOfferDetected: IOffer | null = paramsClone?.offerInfo?.exitOfferDetected!;
    if (exitOfferDetected) {
      const exitOfferNestedRes = exitOfferNested(paramsClone, exitOfferDetected);
      if (exitOfferNestedRes) {
        paramsClone = { ...paramsClone, ...exitOfferNestedRes };
      }
    }
  }

  return paramsClone;
};
