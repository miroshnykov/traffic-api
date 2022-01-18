import { Request } from 'express';
import consola from 'consola';
import { influxdb } from '../Utils/metrics';

import { IParams, IResponse } from '../Interfaces/params';
import { getParams } from './params';
import { lidOffer } from '../Utils/lid';
import { createLidOffer } from '../Utils/dynamoDb';
import { ILid } from '../Interfaces/lid';
// import { getFp, setFp } from '../Models/fpModel';
// import { fingerPrintOverride } from './override/fingerPrintOverride';
import { exitOfferOverride } from './override/exitOfferOverride';
import { handleConditions } from './handleConditions';

export const offersServices = async (req: Request): Promise<IResponse> => {
  const debug: boolean = req?.query?.debugging! === 'debugging';
  try {
    influxdb(200, 'offers_all_request');
    const params: IParams = await getParams(req);

    // consola.info(`finger print key fp:${req.fingerprint?.hash!}-${params.campaignId}`)
    // const fpData = await getFp(`fp:${req.fingerprint?.hash!}-${params.campaignId}`)

    const handleConditionsResponse: IResponse = await handleConditions(params, debug);

    const finalResponse:IResponse = exitOfferOverride(handleConditionsResponse);

    // await fingerPrintOverride(params, req, fpData)

    const lidObj: ILid = lidOffer(finalResponse?.params!);
    createLidOffer(lidObj);
    finalResponse!.params!.lidObj = lidObj;

    return finalResponse;
  } catch (e) {
    consola.error('Service offer error:', e);
    influxdb(500, 'offer_ad_error');
    return {
      success: false,
      errors: e,
      debug,
    };
  }
};
