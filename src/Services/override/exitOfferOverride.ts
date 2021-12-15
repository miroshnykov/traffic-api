import {IResponse} from "../../Interfaces/params";
import {customPayOutPerGeo} from "../offers/customPayOutPerGeo";
import {influxdb} from "../../Utils/metrics";
import consola from "consola";
import {exitOfferCustomPayout, exitOfferNested} from "../offers/exitOfferNested";
import {IOffer} from "../../Interfaces/offers";

export const exitOfferOverride = async (handleConditionsResponse: IResponse): Promise<void> => {
  //PH-459
  if (handleConditionsResponse?.success
    && (handleConditionsResponse?.data?.offerInfo?.capInfo?.capsSalesUnderLimit
      || handleConditionsResponse?.data?.offerInfo?.capInfo?.capsClicksUnderLimit)
    && handleConditionsResponse?.data.offerInfo?.customPayOutPerGeo) {

    const customPayOutPerGeoRes: boolean = await customPayOutPerGeo(handleConditionsResponse?.data)
    if (customPayOutPerGeoRes) {
      influxdb(200, 'offer_custom_pay_out_per_geo_caps_under_limit')
      consola.info(` -> additional override Redirect type { offer customPayOutPerGeo CapsUnderLimit } lid { ${handleConditionsResponse?.data.lid} }`)
    }
  }

  if (handleConditionsResponse?.success
    && handleConditionsResponse?.data?.isExitOffer) {

    //PH-426
    if (handleConditionsResponse?.data?.exitOfferInfo?.customPayOutPerGeo!) {
      exitOfferCustomPayout(handleConditionsResponse?.data, handleConditionsResponse)
    }
  }

  //PH-428
  if (handleConditionsResponse?.success
    && handleConditionsResponse?.data
    && handleConditionsResponse?.data?.offerInfo?.exitOfferDetected
  ) {
    const exitOfferDetected: IOffer | null = handleConditionsResponse?.data?.offerInfo?.exitOfferDetected!
    if (exitOfferDetected) {
      await exitOfferNested(handleConditionsResponse?.data, exitOfferDetected)
    }
  }
}