import consola from 'consola';
import { IBaseResponse, IParams } from '../../Interfaces/params';
import { IFingerPrintData } from '../../Interfaces/fp';
// import { fpOverride } from '../offers/fpOverride';
// import { influxdb } from '../../Utils/metrics';
import { setFp } from '../../Models/fpModel';
// import { IOffer, IOfferType } from '../../Interfaces/offers';
// import { getOffer } from '../../Models/offersModel';

export const fingerPrintOverride = async (
  params: IParams,
  fpData: string | undefined,
): Promise<IBaseResponse> => {
  let pass: boolean = false;
  const paramsClone = { ...params };
  if (params.debugFp) {
    return {
      success: pass,
    };
  }
  const fpKey = `fp:${params.fingerPrintKey!}-${paramsClone.campaignId}`;
  if (fpData) {
    consola.info(` *** [GET_FINGER_PRINT] *** FROM CACHE ${fpKey}`);
    // disabled cache because  of PH-885
    // if (paramsClone.offerType === IOfferType.AGGREGATED) {
    //   const fpDataObj: IFingerPrintData = JSON.parse(fpData);
    //
    //   const offer: any = await getOffer(fpDataObj.offerId);
    //   const offerInfo: IOffer = JSON.parse(offer);
    //   if (offerInfo?.capInfo?.capsClicksOverLimit
    //     || offerInfo?.capInfo?.capsSalesOverLimit
    //   ) {
    //     consola.info(` -----> Check caps for offerId:${fpDataObj.offerId} capsClicksOverLimit:${offerInfo?.capInfo?.capsClicksOverLimit},  capsSalesOverLimit:${offerInfo?.capInfo?.capsSalesOverLimit}`);
    //     influxdb(200, 'offer_aggregated_fingerprint_override_caps_over_limit');
    //   } else if (offerInfo === null) {
    //     consola.info(` -----> offerId ${fpDataObj.offerId} does not exists in recipe `);
    //     influxdb(200, 'offer_aggregated_fingerprint_override_recipe_empty');
    //   } else {
    //     consola.info(' -----> Offer has type aggregated so lets do override use finger print data from cache');
    //     const fpOverrideRes = await fpOverride(paramsClone, fpDataObj);
    //     paramsClone = { ...paramsClone, ...fpOverrideRes };
    //     influxdb(200, 'offer_aggregated_fingerprint_override');
    //     // expireFp(fpKey, 86400);
    //   }
    // }
    paramsClone.isUniqueVisit = false;
    pass = true;
  } else {
    const fpStore: IFingerPrintData = {
      landingPageUrl: paramsClone.landingPageUrl,
      offerId: paramsClone.offerId,
      offerName: paramsClone.offerName,
      offerDescription: paramsClone.offerDescription,
      advertiserId: paramsClone.advertiserId,
      advertiserName: paramsClone.advertiserName,
      conversionType: paramsClone.conversionType,
      verticalId: paramsClone.verticalId,
      verticalName: paramsClone.verticalName,
      payin: paramsClone.payIn,
      payout: paramsClone.payOut,
    };
    consola.info(' *** [SET_FINGER_PRINT] ***');
    setFp(fpKey, JSON.stringify(fpStore));
    pass = false;
  }
  return {
    success: pass,
    params: paramsClone,
  };
};
