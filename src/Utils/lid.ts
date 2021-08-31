export const lidOffer = (params:any) => (
  {
    'lid': params.lid || null,
    'adDomain': params.host || null,
    'adPath': params.originalUrl || null,
    'device': params.deviceType || null,
    'domain': params.adDomain || null,
    'campaignId': +params.campaignId || null,
    'payin': params.payin || null,
    'payout': params.payout || null,
    'advertiserId': params.advertiserId || null,
    'advertiserManagerId': params.advertiserManagerId || null,
    'advertiserName': params.advertiserName || null,
    'verticalId': params.verticalId || null,
    'verticalName': params.verticalName || null,
    'offerId': +params.offerId || null,
    'region': params.region,
    'isp': params.isp,
    'sflServer': params.host,
    'userAgent': params.userAgent || null,
    'browser': params.browser || null,
    'browserEngine': params.browserEngine || null,
    'browserVersion': params.browserVersion || null,
    'affiliateId': params.affiliateId || null,
    'affiliateManagerId': params.affiliateManagerId || null,
    'payoutPercent': params.payoutPercent || null,
    'isCpmOptionEnabled': params.isCpmOptionEnabled || 0,
    'landingPage': params.landingPageUrl || null,
    'landingPageId': params.landingPageId || null,
    'conversionType': params.conversionType || null,
    'os': params.os || null,
    'refererDomain': params.refererDomain || null,
    'refererPath': params.referer || null,
    'searchEngine': params.searchEngine || null,
    'referredAdvertiserId': params.referredAdvertiserId || null,
    'referredAdvertiserName': params.referredAdvertiserName || null,
    'referredConversionType': params.referredConversionType || null,
    'referredIsCpmOptionEnabled': params.referredIsCpmOptionEnabled || 0,
    'referredOfferId': +params.referredOfferId || null,
    'referredVerticalId': +params.referredVerticalId || null,
    'referredVerticalName': params.referredVerticalName || null,
    'landingPageUrlOrigin': params.landingPageUrlOrigin || null,
    'capOverrideOfferId': +params.capOverrideOfferId || null,
    'offerIdRedirectExitTraffic': params.offerIdRedirectExitTraffic || null,
    'redirectType': params.redirectType || null,
    'redirectReason': params.redirectReason || null,
    'capsType': params.capsType || null,
    'country': params.country || null,
    'event_type': 'click',
    '_messageType': 'aggregatorStatSflOffer'
  }
)

