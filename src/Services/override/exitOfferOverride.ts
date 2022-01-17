import consola from 'consola';
import { IBaseResponse, IResponse } from '../../Interfaces/params';
import { customPayOutPerGeo } from '../offers/customPayOutPerGeo';
import { influxdb } from '../../Utils/metrics';
import { exitOfferCustomPayout, exitOfferNested } from '../offers/exitOfferNested';
import { IOffer } from '../../Interfaces/offers';

export const exitOfferOverride = (handleConditionsResponse: IResponse): void => {
  // PH-459
  if (handleConditionsResponse?.success
    && (handleConditionsResponse?.params?.offerInfo?.capInfo?.capsSalesUnderLimit
      || handleConditionsResponse?.params?.offerInfo?.capInfo?.capsClicksUnderLimit)
    && handleConditionsResponse?.params.offerInfo?.customPayOutPerGeo) {
    const customPayOutPerGeoRes:IBaseResponse = customPayOutPerGeo(handleConditionsResponse?.params);
    if (customPayOutPerGeoRes.success) {
      handleConditionsResponse!.params = { ...handleConditionsResponse?.params, ...customPayOutPerGeoRes.params };
      // responseParams.params = { ...handleConditionsResponse?.params, ...customPayOutPerGeoRes.params };
      // responseParams.success = true;
      influxdb(200, 'offer_custom_pay_out_per_geo_caps_under_limit');
      consola.info(` -> additional override Redirect type { offer customPayOutPerGeo CapsUnderLimit } lid { ${handleConditionsResponse?.params.lid} }`);
    }
  }

  if (handleConditionsResponse?.success
    && handleConditionsResponse?.params?.isExitOffer) {
    // PH-426
    if (handleConditionsResponse?.params?.exitOfferInfo?.customPayOutPerGeo!) {
      const exitOfferCustomPayoutRes = exitOfferCustomPayout(handleConditionsResponse?.params, handleConditionsResponse);
      if (exitOfferCustomPayoutRes) {
        handleConditionsResponse!.params = { ...handleConditionsResponse?.params, ...exitOfferCustomPayoutRes };
      }
    }
  }

  // PH-428
  if (handleConditionsResponse?.success
    && handleConditionsResponse?.params
    && handleConditionsResponse?.params?.offerInfo?.exitOfferDetected
  ) {
    const exitOfferDetected: IOffer | null = handleConditionsResponse?.params?.offerInfo?.exitOfferDetected!;
    if (exitOfferDetected) {
      const exitOfferNestedRes = exitOfferNested(handleConditionsResponse?.params, exitOfferDetected);
      if (exitOfferNestedRes) {
        handleConditionsResponse!.params = { ...handleConditionsResponse?.params, ...exitOfferNestedRes };
      }
    }
  }
};
