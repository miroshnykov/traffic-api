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

export const offersServices = async (req: Request) => {
  try {
    influxdb(200, 'offers_all_request')
    const params: IParams = await getParams(req)

    if (params.offerInfo.type === 'aggregated') {
      const offerAggregatedRes: boolean = await offerAggregatedCalculations(params)
      if (offerAggregatedRes) {
        influxdb(200, 'offer_aggregated')
        consola.info(` **** info aggregated lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.startEndDateSetup) {
      const offersStartEndDateSetupRes: boolean = await offersStartEndDateSetupCalculations(params)
      if (offersStartEndDateSetupRes) {
        influxdb(200, 'offer_start_end_date_setup')
        consola.info(` **** info startEndDateSetup lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.geoRules) {
      const offersGeoRestrictionsRes: boolean = await offersGeoRestrictions(params)
      if (offersGeoRestrictionsRes) {
        influxdb(200, 'offer_geo_rules')
        consola.info(` **** info geoRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.customPayOutPerGeo) {
      const customPayOutPerGeoRes: boolean = await customPayOutPerGeo(params)
      if (customPayOutPerGeoRes) {
        influxdb(200, 'offer_custom_pay_out_per_geo')
        consola.info(` **** info customPayOutPerGeo lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.customLpRules) {
      const offersCustomLpRulesRes: boolean = await offersCustomLpRules(params)
      if (offersCustomLpRulesRes) {
        influxdb(200, 'offer_custom_lp_rules')
        consola.info(` **** info customLpRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.campaignInfo.capSetup) {
      let capsCheckingRes: boolean = await capsCampaignChecking(params)
      if (capsCheckingRes) {
        consola.info(` **** info capCampaignsSetup lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    if (params.offerInfo.capSetup) {
      let capsCheckingRes: boolean = await capsOfferChecking(params)
      if (capsCheckingRes) {
        consola.info(` **** info capSetup lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }

    }

    if (params.campaignInfo.targetRules) {
      let campaignsTargetRulesRes: boolean = await campaignsTargetRules(params)
      if (campaignsTargetRulesRes) {
        influxdb(200, 'offer_target_rules')
        consola.info(` **** info targetRules lid { ${params.lid} } ${JSON.stringify(params)}`)
        return {
          success: true,
          data: params
        }
      }
    }

    let resOffer: IParams = await offersDefaultRedirection(params)
    influxdb(200, 'offer_default_redirection')
    consola.info(`Info default lid { ${params.lid} } data ${JSON.stringify(params)}`)
    return {
      success: true,
      data: resOffer
    }

  } catch (e) {
    consola.error('Service offer error:', e)
    influxdb(500, 'offer_ad_error')
    return {
      success: false,
      errors: e
    }
  }
};


