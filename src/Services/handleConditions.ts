import consola from 'consola';
import {
  IBaseResponse, IParams, IResponse,
} from '../Interfaces/params';
import { IOfferType } from '../Interfaces/offers';
import { offerAggregatedCalculations } from './offers/aggregated/offersAggregated';
import { influxdb } from '../Utils/metrics';
import { offersStartEndDateSetupCalculations } from './offers/restrictions/offersStartEndDateSetup';
import { offersGeoRestrictions } from './offers/restrictions/offersGeoRestrictions';
import { offersCustomLpRules } from './offers/restrictions/offersCustomLpRules';
import { capsCampaignChecking } from './campaigns/caps/capsSetup';
import { capsOfferChecking } from './offers/caps/capsSetup';
import { customPayOutPerGeo } from './offers/customPayOutPerGeo';
import { campaignsTargetRules } from './campaigns/restrictions/targetRules';
import { offersDefaultRedirection } from './offers/defaultRedirection';

export const handleConditions = async (params: IParams, debug: boolean): Promise<IResponse> => {
  if (params.offerInfo.type === IOfferType.AGGREGATED) {
    const offerAggregatedRes: IBaseResponse = await offerAggregatedCalculations(params);
    if (offerAggregatedRes.success) {
      influxdb(200, 'offer_aggregated');
      consola.info(`[REDIRECT_TYPE] { offer aggregated } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${offerAggregatedRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: offerAggregatedRes.params,
        debug,
      };
    }
  }

  if (params.offerInfo.startEndDateSetup) {
    const offersStartEndDateSetupRes: IBaseResponse = await offersStartEndDateSetupCalculations(params);
    if (offersStartEndDateSetupRes.success) {
      influxdb(200, 'offer_start_end_date_setup');
      consola.info(`[REDIRECT_TYPE] { offer startEndDateSetup } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${offersStartEndDateSetupRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: offersStartEndDateSetupRes.params,
        debug,
      };
    }
  }

  if (params.offerInfo.countriesRestrictions) {
    const offersGeoRestrictionsRes: IBaseResponse = await offersGeoRestrictions(params);
    if (offersGeoRestrictionsRes.success) {
      influxdb(200, 'offer_geo_rules');
      consola.info(`[REDIRECT_TYPE] { offer geoRules } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${offersGeoRestrictionsRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: offersGeoRestrictionsRes.params,
        debug,
      };
    }
  }

  if (params.offerInfo.customLpRules) {
    const offersCustomLpRulesRes: IBaseResponse = await offersCustomLpRules(params);
    if (offersCustomLpRulesRes.success) {
      influxdb(200, 'offer_custom_lp_rules');
      consola.info(`[REDIRECT_TYPE] { offer customLpRules } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${offersCustomLpRulesRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: offersCustomLpRulesRes.params,
        debug,
      };
    }
  }

  if (params.campaignInfo.capSetup) {
    const capsCheckingRes: IBaseResponse = await capsCampaignChecking(params);
    if (capsCheckingRes.success) {
      consola.info(`[REDIRECT_TYPE] { campaign caps } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${capsCheckingRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: capsCheckingRes.params,
        debug,
      };
    }
  }

  if (params.offerInfo.capSetup) {
    const capsCheckingRes: IBaseResponse = await capsOfferChecking(params);
    if (capsCheckingRes.success) {
      consola.info(`[REDIRECT_TYPE] { offer caps } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${capsCheckingRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: capsCheckingRes.params,
        debug,
      };
    }
  }

  if (params.offerInfo.customPayOutPerGeo) {
    const customPayOutPerGeoRes: IBaseResponse = await customPayOutPerGeo(params);
    if (customPayOutPerGeoRes.success) {
      influxdb(200, 'offer_custom_pay_out_per_geo');
      consola.info(`[REDIRECT_TYPE] { offer customPayOutPerGeo } CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${customPayOutPerGeoRes.params?.landingPageUrl} }`);
      return {
        success: true,
        params: customPayOutPerGeoRes.params,
        debug,
      };
    }
  }

  if (params.campaignInfo.targetRules) {
    const campaignsTargetRulesRes: boolean = await campaignsTargetRules(params);
    if (campaignsTargetRulesRes) {
      influxdb(200, 'offer_target_rules');
      consola.info(`[REDIRECT_TYPE] { campaign targetRules } lid { ${params.lid} }`);
      return {
        success: true,
        params,
        debug,
      };
    }
  }

  const offersDefaultRes: IBaseResponse = await offersDefaultRedirection(params);
  if (offersDefaultRes.success) {
    influxdb(200, 'offer_default_redirection');
    consola.info(`[REDIRECT_TYPE] { offer default }  CampaignId { ${params.campaignId} } lid { ${params.lid} } LP { ${offersDefaultRes.params?.landingPageUrl} `);
    return {
      success: true,
      params: offersDefaultRes.params,
      debug,
    };
  }

  return {
    success: false,
    params,
    debug,
  };
};
