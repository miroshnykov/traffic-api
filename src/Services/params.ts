import { Request } from 'express';
import DeviceDetector from 'device-detector-js';
import { v4 } from 'uuid';
import consola from 'consola';
import { decrypt } from '../Utils/decrypt';
import { IFingerPrint, IParams } from '../Interfaces/params';
import { getOffer } from '../Models/offersModel';
import { influxdb } from '../Utils/metrics';
import { getCampaign } from '../Models/campaignsModel';
import { resolveIP } from '../Utils/geo';
import { IExitOfferResult, IOffer, IOfferStatus } from '../Interfaces/offers';
import { ICampaign } from '../Interfaces/campaigns';
import { IGeo } from '../Interfaces/geo';
import { ICapsResult } from '../Interfaces/caps';
import { CampaignDefault } from '../Utils/defaultCampaign';

export const getParams = async (req: Request): Promise<IParams> => {
  try {
    const fingerPrintKey = req.fingerprint?.hash;
    const offerEncoded: string = String(req.query.o! || '');
    const encKey: string = process.env.ENCRIPTION_KEY || '';
    const decodedString: string = decrypt(offerEncoded, encKey);
    // const decodedObj: IDecodedUrl = JSON.parse(decodedString!)
    // const offerId: number = Number(decodedObj.offerId)
    // const campaignId: number = Number(decodedObj.campaignId)

    const inputData = decodedString.split('|');

    let offerId: number = Number(inputData[0]);
    let campaignId: number = Number(inputData[1]);

    let offer = await getOffer(offerId);
    if (!offer) {
      influxdb(500, `offer_${offerId}_recipe_error`);
      throw Error(`no offerId ${offerId} in recipe campaignId-${campaignId}`);
    }
    let campaign = await getCampaign(campaignId);
    if (!campaign) {
      influxdb(500, `campaign_${campaignId}_recipe_error`);
      throw Error(`no campaignId-${campaignId} in recipe offerId-${offerId}`);
    }

    let campaignInfo: ICampaign = JSON.parse(campaign!);

    let offerInfo: IOffer = JSON.parse(offer!);

    if (offerInfo.status === IOfferStatus.INACTIVE) {
      campaignId = process.env.NODE_ENV === 'production'
        ? CampaignDefault.CAMPAIGN_ID
        : CampaignDefault.STAGE_CAMPAIGN_ID;
      campaign = await getCampaign(campaignId);
      campaignInfo = JSON.parse(campaign!);
      offerId = campaignInfo.offerId;
      offer = await getOffer(offerId);
      offerInfo = JSON.parse(offer!);
      consola.info(`Use campaign default ${campaignId}`);
      influxdb(200, 'campaign_default');
    }

    const startTime: number = new Date().getTime();
    const speedTime: number = 0;

    const deviceDetector = new DeviceDetector();
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = deviceDetector.parse(userAgent);

    const deviceType: string = deviceInfo?.device?.type!;

    // @ts-ignore
    const browserEngine = deviceInfo?.client?.engine || '';

    const browserVersion = String(deviceInfo?.client?.version!);
    const offerHash = req.query.o;
    const subCampaign: string = String(req.query.subid || '');
    const cid: string = String(req.query.cid || '');
    const browser: string = String(deviceInfo?.client?.name!);
    const os: string = String(deviceInfo?.os?.name!);
    const platform: string = String(deviceInfo?.os?.platform!);
    const host: string = String(req?.headers?.host!);
    const originalUrl: string = String(req?.originalUrl!);
    const adDomain: string = String(req?.query?.ad_domain!);
    const referer = req.headers.referer || '';
    const geoInfo: IGeo = await resolveIP(req);
    const country: string = String(geoInfo?.country);
    const region: string = String(geoInfo?.region);
    const city: string = String(geoInfo?.city);
    const isp: string = String(geoInfo?.isp);
    const IP: string = String(geoInfo?.IP);
    const lid: string = v4();

    const affiliateId: number = Number(campaignInfo.affiliateId);
    const affiliateStatus: string = String(campaignInfo.affiliateStatus);
    const affiliateType: string = String(campaignInfo.affiliateType);
    const campaignStatus: string = String(campaignInfo.campaignStatus);
    const affiliateManagerId: number = Number(campaignInfo.affiliateManagerId);
    const offerType: string = offerInfo.type;
    const offerDescription: string = offerInfo.descriptions;
    const offerName: string = offerInfo.name;
    const {
      conversionType, landingPageId, landingPageUrl, verticalId, verticalName,
      advertiserId, advertiserName, advertiserManagerId, isCpmOptionEnabled,
    } = offerInfo;
    const payIn: number = Number(offerInfo.payin);
    const payoutPercent: number = Number(offerInfo.payoutPercent);
    const payOut: number = Number(campaignInfo.payout ? campaignInfo.payout : offerInfo.payout);
    const redirectUrl: string = '';
    const capsResult: ICapsResult = {};
    const exitOfferResult: IExitOfferResult = {};
    const isExitOffer: boolean = false;
    const isUniqueVisit: boolean = true;
    const fingerPrint: IFingerPrint = {};

    return {
      offerId,
      campaignId,
      subCampaign,
      affiliateId,
      affiliateStatus,
      affiliateType,
      campaignStatus,
      affiliateManagerId,
      offerType,
      deviceType,
      offerName,
      offerDescription,
      conversionType,
      landingPageId,
      landingPageUrl,
      payIn,
      payOut,
      payoutPercent,
      isCpmOptionEnabled,
      verticalId,
      verticalName,
      advertiserId,
      advertiserName,
      advertiserManagerId,
      offerInfo,
      lid,
      campaignInfo,
      browser,
      host,
      originalUrl,
      adDomain,
      userAgent,
      referer,
      browserEngine,
      browserVersion,
      os,
      platform,
      geoInfo,
      country,
      city,
      isp,
      region,
      offerHash,
      startTime,
      speedTime,
      redirectUrl,
      capsResult,
      IP,
      isExitOffer,
      exitOfferResult,
      fingerPrint,
      fingerPrintKey,
      isUniqueVisit,
      cid,
    };
  } catch (e) {
    influxdb(500, 'get_params_error');
    consola.error('getParamsError:', e);
    throw Error(e);
  }
};
