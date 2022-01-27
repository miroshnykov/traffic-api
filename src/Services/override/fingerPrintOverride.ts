import { Request } from 'express';
import consola from 'consola';
import { IBaseResponse, IParams } from '../../Interfaces/params';
import { IFingerPrintData } from '../../Interfaces/fp';
import { fpOverride } from '../offers/fpOverride';
import { influxdb } from '../../Utils/metrics';
import { expireFp, setFp } from '../../Models/fpModel';
import { IOfferType } from '../../Interfaces/offers';

export const fingerPrintOverride = async (
  params: IParams,
  req: Request,
  fpData: string | undefined,
): Promise<IBaseResponse> => {
  const debugFp: boolean = req?.query?.fp! === 'disabled';
  let pass: boolean = false;
  let paramsClone = { ...params };
  if (debugFp) {
    return {
      success: pass,
    };
  }
  const fpKey = `fp:${req.fingerprint?.hash!}-${paramsClone.campaignId}`;
  if (fpData) {
    consola.info(` ***** GET FINGER_PRINT FROM CACHE ${fpKey} from cache, data  `, fpData);
    if (paramsClone.offerType === IOfferType.AGGREGATED) {
      consola.info(' -----> Offer has type aggregated so lets do override use finger print data from cache');
      const fpDataObj: IFingerPrintData = JSON.parse(fpData);
      const fpOverrideRes = await fpOverride(paramsClone, fpDataObj);
      paramsClone = { ...paramsClone, ...fpOverrideRes };
      influxdb(200, 'offer_aggregated_fingerprint_override');
      expireFp(fpKey, 86400);
    }
    paramsClone.isUniqueVisit = false;
    pass = true;
  } else {
    const fpStore: IFingerPrintData = {
      landingPageUrl: paramsClone.landingPageUrl,
      offerId: paramsClone.offerId,
      advertiserId: paramsClone.advertiserId,
      advertiserName: paramsClone.advertiserName,
      conversionType: paramsClone.conversionType,
      verticalId: paramsClone.verticalId,
      verticalName: paramsClone.verticalName,
      payin: paramsClone.payIn,
      payout: paramsClone.payOut,
    };
    consola.info(' ***** SET CACHE FINGER_PRINT');
    setFp(fpKey, JSON.stringify(fpStore));
    pass = false;
  }
  return {
    success: pass,
    params: paramsClone,
  };
};
