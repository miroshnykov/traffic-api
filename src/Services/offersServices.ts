import { Request } from 'express';
import consola from 'consola';
import { influxdb } from '../Utils/metrics';

import { ILandingPageParams, IParams, IResponse } from '../Interfaces/params';
import { getParams } from './params';
import { lidOffer } from '../Utils/lid';
import { createLidOffer } from '../Utils/dynamoDb';
import { ILid } from '../Interfaces/lid';
import { getFp } from '../Models/fpModel';
import { fingerPrintOverride } from './override/fingerPrintOverride';
import { exitOfferOverride } from './override/exitOfferOverride';
import { handleConditions } from './handleConditions';
import { AffiliateStatus } from '../Interfaces/affiliates';
import { ICampaignStatus } from '../Interfaces/campaigns';

export const offersServices = async (req: Request): Promise<IResponse> => {
  const debug: boolean = req?.query?.debugging! === 'debugging';
  try {
    influxdb(200, 'offers_all_request');
    const params: IParams = await getParams(req);
    if (params.affiliateStatus === AffiliateStatus.BLACKLISTED) {
      influxdb(200, 'blocked_affiliate');
      consola.error(`Blocked by affiliateId:${params.affiliateId} with status ${params.affiliateStatus}`);
      return {
        block: true,
        blockReason: `Blocked by affiliateId:${params.affiliateId}`,
        success: false,
        params,
        debug,
      };
    }

    if (params.campaignStatus === ICampaignStatus.INACTIVE
      || params.campaignStatus === ICampaignStatus.PENDING
      || params.campaignStatus === ICampaignStatus.BLOCKED
    ) {
      influxdb(200, `blocked_${params.campaignStatus}_campaign`);
      consola.error(`Blocked by campaign:${params.campaignId} with status ${params.campaignStatus}`);
      return {
        block: true,
        blockReason: `Blocked by campaign:${params.campaignId} with status ${params.campaignStatus}`,
        success: false,
        params,
        debug,
      };
    }
    // consola.info(`finger print key fp:${req.fingerprint?.hash!}-${params.campaignId}`);
    const fpData = await getFp(`fp:${req.fingerprint?.hash!}-${params.campaignId}`);

    const handleConditionsResponse: IResponse = await handleConditions(params, debug);
    let finalResponse: IParams;
    if (handleConditionsResponse?.success) {
      finalResponse = exitOfferOverride(handleConditionsResponse?.params!);
    } else {
      finalResponse = { ...params };
    }
    const fingerPrintRes: IResponse = await fingerPrintOverride(finalResponse, req, fpData);

    if (fingerPrintRes.success) {
      finalResponse = { ...finalResponse, ...fingerPrintRes.params };
    }

    ILandingPageParams.forEach((item) => {
      if (item === 'lid') {
        finalResponse.landingPageUrl = finalResponse.landingPageUrl
          && finalResponse.landingPageUrl.replace(`{${item}}`, finalResponse.lid);
      } else {
        const tmp = req?.query[item];
        if (tmp) {
          finalResponse.landingPageUrl = finalResponse.landingPageUrl
            && finalResponse.landingPageUrl.replace(`{${item}}`, String(tmp));
        }
      }
    });

    const lidObj: ILid = lidOffer(finalResponse!);
    createLidOffer(lidObj);
    finalResponse!.lidObj = lidObj;
    handleConditionsResponse.params = { ...finalResponse! };
    return handleConditionsResponse;
  } catch (e) {
    consola.error('Service offer error:', e);
    influxdb(500, 'offer_ad_error');
    return {
      success: false,
      errors: e.toString(),
      debug,
    };
  }
};
