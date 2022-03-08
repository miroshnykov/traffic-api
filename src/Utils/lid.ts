import { IParams } from '../Interfaces/params';
import { ILid } from '../Interfaces/lid';

export const lidOffer = (params: IParams): ILid => (
  {
    lid: params.lid || '',
    adDomain: params.host || null,
    adPath: params.originalUrl || null,
    deviceType: params.deviceType || null,
    domain: params.domain || null,
    campaignId: +params.campaignId || null,
    subCampaign: params.subCampaign! || null,
    cid: params.cid! || null,
    payin: +params.payIn || null,
    payout: +params.payOut || null,
    advertiserId: params.advertiserId || null,
    advertiserManagerId: params.advertiserManagerId || null,
    advertiserName: params.advertiserName || null,
    verticalId: params.verticalId || null,
    verticalName: params.verticalName || null,
    offerId: +params.offerId || null,
    offerName: params.offerName || null,
    offerType: params.offerType || null,
    offerDescription: params.offerDescription || null,
    region: params.region,
    isp: params.isp,
    IP: params.IP || '',
    sflServer: params.host,
    userAgent: params.userAgent || null,
    browser: params.browser || null,
    browserEngine: params.browserEngine || null,
    browserVersion: params.browserVersion || null,
    affiliateId: params.affiliateId || null,
    affiliateManagerId: params.affiliateManagerId || null,
    payoutPercent: params.payoutPercent || null,
    isCpmOptionEnabled: params.isCpmOptionEnabled || 0,
    landingPageUrl: params.landingPageUrl || null,
    landingPageId: params.landingPageId || null,
    conversionType: params.conversionType || null,
    os: params.os || null,
    referer: params.referer || null,
    originPayIn: params.originPayIn || 0,
    originPayOut: params.originPayOut || 0,
    originAdvertiserId: params.originAdvertiserId || null,
    originAdvertiserName: params.originAdvertiserName || null,
    originConversionType: params.originConversionType || null,
    originIsCpmOptionEnabled: params.originIsCpmOptionEnabled || 0,
    originOfferId: +params.originOfferId! || null,
    originVerticalId: +params.originVerticalId! || null,
    originVerticalName: params.originVerticalName || null,
    landingPageIdOrigin: params.landingPageIdOrigin || null,
    landingPageUrlOrigin: params.landingPageUrlOrigin || null,
    capOverrideOfferId: +params.capOverrideOfferId! || 0,
    offerIdRedirectExitTraffic: params.offerIdRedirectExitTraffic || null,
    redirectType: params.redirectType || null,
    redirectReason: params.redirectReason || null,
    capsType: params?.capsResult?.capsType || null,
    country: params.country || null,
    platform: params.platform || null,
    isUseDefaultOfferUrl: params.isUseDefaultOfferUrl || null,
    nestedExitOfferSteps: params?.exitOfferResult?.steps || null,
    fingerPrintInfo: params?.fingerPrint.info || null,
    fingerPrintKey: params?.fingerPrintKey || null,
    isUniqueVisit: params?.isUniqueVisit,
    eventType: 'click',
    _messageType: 'aggregatorStatSflOffer',
  }
);
