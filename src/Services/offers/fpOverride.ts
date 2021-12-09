import {IParams} from "../../Interfaces/params";
import consola from "consola";
import {IFingerPrintData} from "../../Interfaces/fp";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const fpOverride = async (params: IParams, fpData: IFingerPrintData): Promise<void> => {
  try {
    params.landingPageUrl = fpData?.landingPageUrl
    params.advertiserId = fpData?.advertiserId || 0
    params.advertiserName = fpData?.advertiserName || ''
    params.conversionType = fpData?.conversionType || ''
    params.offerId = fpData?.offerId || 0
    params.verticalId = fpData?.verticalId || 0
    params.verticalName = fpData?.verticalName || ''
    params.payin = fpData?.payin || 0
    params.payout = fpData?.payout || 0
    params.fingerPrint.info = IRedirectType.FINGER_PRINT_OVERRIDE
    params.fingerPrint.fpData = fpData

  } catch (e) {
    consola.error('fpOverride fields error', e)
  }
}
