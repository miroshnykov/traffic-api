import url from "url";
import consola from "consola";
import {sendMessageToQueue} from "./sqs";
import {influxdb} from "./metrics";
import {IParams} from "../Interfaces/params";
import {ISqsMessage} from "../Interfaces/sqsMessage";
import {REDIRECT_URLS} from "./defaultRedirectUrls";
import {getDefaultOfferUrl} from "./defaultOffer";
import {encrypt} from "./encrypt";
import {decrypt} from "./decrypt";
import * as dotenv from "dotenv";

dotenv.config();

export const redirectUrl = async (lp: string, params: IParams) => {

  if (!lp) {
    influxdb(200, `default_offer_url_for_offer_id_${params.offerId}`)
    lp = await getDefaultOfferUrl() || REDIRECT_URLS.DEFAULT
  }
  let query = url.format({
    query: {
      'offer_id': params.offerId || 0,
      'campaign_id': params.campaignId || 0,
      'lid': params.lid || '',
      'ap': 2, // network_id (1-Crystads , 2-Ad-Firm )
    }
  })

  query = lp.includes('?') ? query.replace('?', '&') : query;
  let urlToRedirect = lp + query;

  let prefix = 'http'

  if (urlToRedirect.substr(0, prefix.length) !== prefix) {
    urlToRedirect = prefix + '://' + urlToRedirect
  }
  const hash = redirectUrlHashGenerator(urlToRedirect) || ''
  urlToRedirect = `${urlToRedirect}&hash=${hash}`
  // const decKey: string = process.env.ENCRIPTION_REDIRECT_URL_KEY || ''
  // const decodedString: string = decrypt(hash, decKey)
  // const decryptedObj = JSON.parse(decodedString!)
  // consola.info('Test decryptedObj:', decryptedObj)
  if (params.conversionType === 'cpm'
    || (params.conversionType === 'hybrid/multistep' && params.isCpmOptionEnabled)
  ) {
    setTimeout(sqsConversionTypeCmpOrHybrid, 30000, params) // 30 sec delay
  }

  return urlToRedirect
}

const redirectUrlHashGenerator = (lp: string) => {
  try {
    let timestamp = Date.now()
    let obj = {
      lp,
      timestamp
    }
    let encodesUrl: string = JSON.stringify(obj);
    let encKey: string = process.env.ENCRIPTION_REDIRECT_URL_KEY || ''
    return encrypt(encodesUrl, encKey)
  } catch (e) {
    consola.error('redirectIrlHashGeneratorError:', e)
  }

}

const sqsConversionTypeCmpOrHybrid = async (params: IParams) => {

  try {
    let conversionTypeBody = {
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
      isCpmOptionEnabled: params.isCpmOptionEnabled
    }

    let sendObj: ISqsMessage = {
      comments: `conversion type ${params.conversionType}`,
      conversion_type: params.conversionType,
      id: params.offerInfo.offerId,
      action: 'update',
      timestamp: Date.now(),
      body: `${JSON.stringify(conversionTypeBody)}`
    }

    consola.info(`Added to SQS Conversion Type Cmp, Body:${JSON.stringify(sendObj)}`)
    sendMessageToQueue(sendObj)

    influxdb(200, `send_sqs_type_cmp_or_hybrid`)
    // params.sendTOSQS = sqsData
    // params.sendTOSQSBody = sendObj
    // params.sqsUrl = process.env.AWS_SQS_QUEUE_URL || ''
  } catch (e) {
    consola.error('sqs err:', e)
  }

}
