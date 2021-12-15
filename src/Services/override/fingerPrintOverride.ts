import {IParams} from "../../Interfaces/params";
import {Request} from "express";
import consola from "consola";
import {IFingerPrintData} from "../../Interfaces/fp";
import {fpOverride} from "../offers/fpOverride";
import {influxdb} from "../../Utils/metrics";
import {setFp} from "../../Models/fpModel";

export const fingerPrintOverride = async (params: IParams, req: Request, fpData: string | null): Promise<void> => {
  const debugFp: boolean = req?.query?.fp! === 'disabled';

  if (debugFp) {
    return
  }

  if (fpData) {
    consola.info(` ***** GET FINGER_PRINT FROM CACHE fp:${req.fingerprint?.hash!}-${params.campaignId} from cache, data  `, fpData)
    if (params.offerType === 'aggregated') {
      consola.info('Offer has type aggregated so lets do override use finger print data from cache')
      const fpDataObj: IFingerPrintData = JSON.parse(fpData)
      await fpOverride(params, fpDataObj)
      influxdb(200, 'offer_aggregated_fingerprint_override')
    }
  } else {

    const fpStore: IFingerPrintData = {
      landingPageUrl: params.landingPageUrl,
      offerId: params.offerId,
      advertiserId: params.advertiserId,
      advertiserName: params.advertiserName,
      conversionType: params.conversionType,
      verticalId: params.verticalId,
      verticalName: params.verticalName,
      payin: params.payin,
      payout: params.payout
    }
    consola.info(` ***** SET CACHE FINGER_PRINT`)

    setFp(`fp:${req.fingerprint?.hash}-${params.campaignId}`, JSON.stringify(fpStore))
  }
}