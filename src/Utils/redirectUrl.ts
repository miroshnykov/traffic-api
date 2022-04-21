import url from 'node:url';
import consola from 'consola';
import * as dotenv from 'dotenv';
import md5 from 'md5';
import { sendMessageToQueue } from './sqs';
import { influxdb } from './metrics';
import { IParams } from '../Interfaces/params';
import { ISqsMessage } from '../Interfaces/sqsMessage';
import { RedirectUrls } from './defaultRedirectUrls';
import { getDefaultOfferUrl } from './defaultOffer';
// import { encrypt } from './encrypt';
// import { decrypt } from './decrypt';

dotenv.config();

// const redirectUrlHashGenerator = (lp: string): string | undefined => {
//   const timestamp = Date.now();
//   const obj = {
//     lp,
//     timestamp,
//   };
//   const encodesUrl: string = JSON.stringify(obj);
//   const encKey: string = process.env.ENCRIPTION_REDIRECT_URL_KEY || '';
//   return encrypt(encodesUrl, encKey);
// };

const redirectUrlHash = (lp: string): string => {
  const secret = process.env.URL_HASH_SECRET;
  return md5(`${lp}|${secret}`);
};

export const redirectUrl = async (params: IParams): Promise<string> => {
  let lp = params.landingPageUrl;
  if (!lp) {
    consola.error(`Landing page is empty for campaignId: ${params.campaignId}`);
    influxdb(500, `default_offer_url_for_offer_id_${params.offerId}`);
    lp = await getDefaultOfferUrl() || RedirectUrls.DEFAULT;
  }
  // if (!params.affiliateId) {
  //   consola.info(`affiliateId is empty  ${JSON.stringify(params)}`);
  //   influxdb(200, `affiliate_id_empty_lid_${params.lid}`);
  // }
  let query = url.format({
    query: {
      offer_id: params.offerId || 0,
      campaign_id: params.campaignId || 0,
      lid: params.lid || '',
      ap: 2, // network_id (1-Crystads , 2-Ad-Firm )
      src: params.affiliateId,
    },
  });

  query = lp.includes('?') ? query.replace('?', '&') : query;
  let urlToRedirect = lp + query;

  const prefix = 'http';

  if (urlToRedirect.substr(0, prefix.length) !== prefix) {
    urlToRedirect = `${prefix}://${urlToRedirect}`;
  }
  // const hash: string = redirectUrlHashGenerator(urlToRedirect) || '';
  const hash: string = redirectUrlHash(urlToRedirect) || '';
  // const secret = process.env.URL_HASH_SECRET;
  // const checkHash = md5(`${urlToRedirect}|${secret}`);

  urlToRedirect = `${urlToRedirect}&hash=${hash}`;
  // const decKey: string = process.env.ENCRIPTION_REDIRECT_URL_KEY || ''
  // const decodedString: string = decrypt(hash, decKey)
  // const decryptedObj = JSON.parse(decodedString!)
  // consola.info('Test decryptedObj:', decryptedObj)
  if (params.conversionType === 'cpm'
    || (params.conversionType === 'hybrid/multistep' && params.isCpmOptionEnabled)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setTimeout(sqsConversionTypeCmpOrHybrid, 30000, params); // 30 sec delay
  }

  return urlToRedirect;
};

const sqsConversionTypeCmpOrHybrid = async (params: IParams): Promise<void> => {
  try {
    const conversionTypeBody = {
      lid: params.lid,
      offerId: params.offerInfo.offerId,
      name: params.offerInfo.name,
      advertiser: params.offerInfo.advertiserId,
      verticals: params.offerInfo.verticalId,
      conversionType: params.offerInfo.conversionType,
      status: params.offerInfo.status,
      payin: params.offerInfo.payin,
      payout: params.offerInfo.payout,
      landingPageId: params.offerInfo.landingPageId,
      landingPageUrl: params.offerInfo.landingPageUrl,
      campaignId: params.campaignInfo.campaignId,
      affiliateId: params.campaignInfo.affiliateId,
      isCpmOptionEnabled: params.isCpmOptionEnabled,
    };

    const sendObj: ISqsMessage = {
      comments: `conversion type ${params.conversionType}`,
      conversion_type: params.conversionType,
      id: params.offerInfo.offerId,
      action: 'update',
      timestamp: Date.now(),
      body: `${JSON.stringify(conversionTypeBody)}`,
    };

    consola.info(`Added to SQS Conversion Type Cmp, Body:${JSON.stringify(sendObj)}`);
    sendMessageToQueue(sendObj);
    // sendMessageToQueue(sendObj).then().catch(e=>{
    //   consola.error('send message')
    // })

    influxdb(200, 'send_sqs_type_cmp_or_hybrid');
    // params.sendTOSQS = sqsData
    // params.sendTOSQSBody = sendObj
    // params.sqsUrl = process.env.AWS_SQS_QUEUE_URL || ''
  } catch (e) {
    consola.error('sqs err:', e);
  }
};
