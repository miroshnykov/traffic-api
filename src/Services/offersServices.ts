import {Request, Response, NextFunction} from 'express';
import {influxdb} from "../Utils/metrics";
import consola from "consola";
import {offersDefaultRedirection} from "./offers/defaultRedirection"
import {offerAggregatedCalculations} from "./offers/offersAggregated"
import {offersStartEndDateSetupCalculations} from "./offers/restrictions/offersStartEndDateSetup"
import {offersGeoRestrictions} from "./offers/restrictions/offersGeoRestrictions"
import {offersCustomLpRules} from "./offers/restrictions/offersCustomLpRules"
import {capsOfferChecking} from "./offers/caps/capsSetup"
import {campaignsTargetRules} from "./campaigns/restrictions/targetRules"
import {customPayOutPerGeo} from "./offers/customPayOutPerGeo";
import {IDecodedUrl, IParams} from "../Interfaces/params"
import {getParams} from "./params";
import {capsCampaignChecking} from "./campaigns/caps/capsSetup";
import {IResponse} from "../Interfaces/params";
import {decrypt} from "../Utils/decrypt";
import {getOffer} from "../Models/offersModel";
import {IOffer} from "../Interfaces/offers";
import {ICustomPayOutPerGeo} from "../Interfaces/customPayOutPerGeo";
import {IRedirectType} from "../Interfaces/recipeTypes";
import {lidOffer} from "../Utils/lid";
import {createLidOffer} from "../Utils/dynamoDb";
import {exitOfferCustomPayout, exitOfferNested} from "./offers/exitOfferNested";
import {ILid} from "../Interfaces/lid";
import {getFp, setFp} from '../Models/fpModel'
import {fpOverride} from "./offers/fpOverride";
import {IFingerPrintData} from "../Interfaces/fp";

export const offersServices = async (req: Request): Promise<IResponse> => {

  const debug: boolean = req?.query?.debugging! === 'debugging';
  try {
    influxdb(200, 'offers_all_request')
    const params: IParams = await getParams(req)

    consola.info(`finger print key fp:${req.fingerprint?.hash!}-${params.campaignId}`)
    const fpData = await getFp(`fp:${req.fingerprint?.hash!}-${params.campaignId}`)

    const handleConditionsResponse: IResponse = await handleConditions(params, debug)

    await additionalOverride(handleConditionsResponse)

    await fingerPrintOverride(params, req, fpData)

    const lidObj: ILid = lidOffer(params)
    createLidOffer(lidObj)
    params.lidObj = lidObj

    return handleConditionsResponse

  } catch (e) {
    consola.error('Service offer error:', e)
    influxdb(500, 'offer_ad_error')
    return {
      success: false,
      errors: e,
      debug: debug
    }
  }
};

const fingerPrintOverride = async (params: IParams, req: Request, fpData: string | null): Promise<void> => {
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

const additionalOverride = async (handleConditionsResponse: IResponse): Promise<void> => {
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

const handleConditions = async (params: IParams, debug: boolean): Promise<IResponse> => {

  if (params.offerInfo.type === 'aggregated') {
    const offerAggregatedRes: boolean = await offerAggregatedCalculations(params)
    if (offerAggregatedRes) {
      influxdb(200, 'offer_aggregated')
      consola.info(`Redirect type { offer aggregated } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.offerInfo.startEndDateSetup) {
    const offersStartEndDateSetupRes: boolean = await offersStartEndDateSetupCalculations(params)
    if (offersStartEndDateSetupRes) {
      influxdb(200, 'offer_start_end_date_setup') //
      consola.info(`Redirect type { offer startEndDateSetup } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.offerInfo.countriesRestrictions) {
    const offersGeoRestrictionsRes: boolean = await offersGeoRestrictions(params)
    if (offersGeoRestrictionsRes) {
      influxdb(200, 'offer_geo_rules')
      consola.info(`Redirect type { offer geoRules } lid { ${params.lid} } `)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.offerInfo.customLpRules) {
    const offersCustomLpRulesRes: boolean = await offersCustomLpRules(params)
    if (offersCustomLpRulesRes) {
      influxdb(200, 'offer_custom_lp_rules')
      consola.info(`Redirect type { offer customLpRules } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.campaignInfo.capSetup) {
    let capsCheckingRes: boolean = await capsCampaignChecking(params)
    if (capsCheckingRes) {
      consola.info(`Redirect type { campaign caps } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.offerInfo.capSetup) {
    let capsCheckingRes: boolean = await capsOfferChecking(params)
    if (capsCheckingRes) {
      consola.info(`Redirect type { offer caps } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.offerInfo.customPayOutPerGeo) {
    const customPayOutPerGeoRes: boolean = await customPayOutPerGeo(params)
    if (customPayOutPerGeoRes) {
      influxdb(200, 'offer_custom_pay_out_per_geo')
      consola.info(`Redirect type { offer customPayOutPerGeo } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }

  if (params.campaignInfo.targetRules) {
    let campaignsTargetRulesRes: boolean = await campaignsTargetRules(params)
    if (campaignsTargetRulesRes) {
      influxdb(200, 'offer_target_rules')
      consola.info(`Redirect type { campaign targetRules } lid { ${params.lid} }`)
      return {
        success: true,
        data: params,
        debug: debug
      }
    }
  }


  let resOffer: IParams = await offersDefaultRedirection(params)
  influxdb(200, 'offer_default_redirection')
  consola.info(`Redirect type { offer default }  lid { ${params.lid} }`)
  return {
    success: true,
    data: resOffer,
    debug: debug
  }

}
