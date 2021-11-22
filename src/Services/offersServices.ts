import {Request, Response, NextFunction} from 'express';
import {getOffer} from '../Models/offersModel'
import {getCampaign} from '../Models/campaignsModel'
import DeviceDetector from "device-detector-js";
import * as QueryString from "querystring";
import {resolveIP} from "../Utils/geo";
import {influxdb} from "../Utils/metrics";
import consola from "consola";
import {decrypt} from "../Utils/decrypt";
import {createLidOffer} from "../Utils/dynamoDb"
import {offersDefaultRedirection} from "./offers/defaultRedirection"
import {offerAggregatedCalculations} from "./offers/offersAggregated"
import {offersStartEndDateSetupCalculations} from "./offers/restrictions/offersStartEndDateSetup"
import {offersGeoRestrictions} from "./offers/restrictions/offersGeoRestrictions"
import {offersCustomLpRules} from "./offers/restrictions/offersCustomLpRules"
import {capsOfferChecking} from "./offers/caps/capsSetup"
import {campaignsTargetRules} from "./campaigns/restrictions/targetRules"
import {v4} from "uuid"
import {customPayOutPerGeo} from "./offers/customPayOutPerGeo";
import {IParams} from "../Interfaces/params"
import {getParams} from "./params";
import {capsCampaignChecking} from "./campaigns/caps/capsSetup";
import {IResponse} from "../Interfaces/params";

export const offersServices = async (req: Request): Promise<IResponse> => {

  const debug: boolean = req?.query?.debugging! === 'debugging';
  try {
    influxdb(200, 'offers_all_request')
    const params: IParams = await getParams(req)

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


