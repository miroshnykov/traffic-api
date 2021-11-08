export enum IRecipeType {
  CAMPAIGN = 'campaign',
  OFFER = 'offer'
}

export enum IRedirectType {
  DEFAULT_REDIRECTION = 'defaultRedirection',
  OFFER_AGGREGATED_BEST_OFFER = 'offerAggregatedBestOffer',
  OFFER_AGGREGATED_EXIT_TRAFFIC = 'offerAggregatedExitTraffic',
  CAMPAIGN_TARGET_RULES = 'campaignTargetRules',
  OFFER_START_END_DATA_RANGE_NOT_PASS = 'OfferStartEndDataRangeNotPass',
  CUSTOM_PAY_OUT_PER_GEO = 'customPayOutPerGeo',
  CUSTOM_LANDING_PAGES = 'customLandingPages',
  OFFER_GEO_RESTRICTION = 'offerGeoRestriction',
  CAPS_OFFER_UNDER_LIMIT = 'capsOfferUnderLimit',
  CAPS_OFFER_DATA_RANGE_NOT_PASS = 'capsOfferDataRangeNotPass',
  CAPS_CAMPAIGN_UNDER_LIMIT = 'capsCampaignUnderLimit',
  CAPS_CAMPAIGN_OVER_LIMIT = 'capsCampaignOverLimit',
  CAPS_CAMPAIGN_DATA_RANGE_NOT_PASS = 'capsCampaignDataRangeNotPass',
  CAPS_CAMPAIGN_OVER_LIMIT_SALES = 'capsCampaignOverLimitSales',
  CAPS_CAMPAIGN_UNDER_LIMIT_ClICKS = 'capsCampaignUnderLimitClicks',
}
