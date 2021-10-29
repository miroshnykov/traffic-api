export enum IRecipeType {
  CAMPAIGN = 'campaign',
  OFFER = 'offer'
}

export enum IRedirectType {
  DEFAULT_REDIRECTION = 'defaultRedirection',
  CAPS_CLICKS_UNDER_LIMIT = 'capsClicksUnderLimit',
  CAPS_UNDER_LIMIT = 'capsUnderLimit',
  CAPS_SALES_UNDER_LIMIT = 'capsSalesUnderLimit',
  CAPS_DATA_RANGE_NOT_PASS = 'capsDataRangeNotPass',
  OFFER_AGGREGATED_BEST_OFFER = 'offerAggregatedBestOffer',
  CAMPAIGN_TARGET_RULES = 'campaignTargetRules',
  OFFER_START_END_DATA_RANGE_NOT_PASS = 'OfferStartEndDataRangeNotPass',
  CUSTOM_PAY_OUT_PER_GEO = 'customPayOutPerGeo',
  CUSTOM_LANDING_PAGES = 'customLandingPages',
  OFFER_GEO_RESTRICTION = 'offerGeoRestriction',
}
