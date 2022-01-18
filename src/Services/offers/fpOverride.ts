import { IParams } from '../../Interfaces/params';
import { IFingerPrintData } from '../../Interfaces/fp';
import { IRedirectType } from '../../Interfaces/recipeTypes';

export const fpOverride = async (
  params: IParams,
  fpData: IFingerPrintData,
): Promise<IParams> => {
  const paramsClone = { ...params };

  paramsClone.landingPageUrl = fpData?.landingPageUrl;
  paramsClone.advertiserId = fpData?.advertiserId || 0;
  paramsClone.advertiserName = fpData?.advertiserName || '';
  paramsClone.conversionType = fpData?.conversionType || '';
  paramsClone.offerId = fpData?.offerId || 0;
  paramsClone.verticalId = fpData?.verticalId || 0;
  paramsClone.verticalName = fpData?.verticalName || '';
  paramsClone.payIn = fpData?.payin || 0;
  paramsClone.payOut = fpData?.payout || 0;
  paramsClone.fingerPrint.info = IRedirectType.FINGER_PRINT_OVERRIDE;
  paramsClone.fingerPrint.fpData = fpData;

  return paramsClone;
};
