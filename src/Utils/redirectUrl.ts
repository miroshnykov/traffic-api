import url from "url";
import consola from "consola";
import {sendMessageToQueue} from "./sqs";

export const redirectUrl = async (lp: string, params: any) => {

  lp = lp && lp || 'defaultRedirectUrl.com' + params.redirectType
  let query = url.format({
    query: {
      'offer_id': params.offerId || 0,
      'campaign_id': params.campaignId || 0,
      'lid': params.lid || '',
    }
  })

  query = lp.includes('?') ? query.replace('?', '&') : query;
  let urlToRedirect = lp + query;

  let prefix = 'http'

  if (urlToRedirect.substr(0, prefix.length) !== prefix) {
    urlToRedirect = prefix + '://' + urlToRedirect
  }
  if (params.conversionType === 'cpm'
    || (params.conversionType === 'hybrid/multistep' && params.isCpmOptionEnabled)
  ) {
    await sqsConversionTypeCmpOrHybrid(params)
  }

  return urlToRedirect
}

const sqsConversionTypeCmpOrHybrid = async (params: any) => {

  try {
    let conversionTypeBody = {
      lid: params.lid,
      offerId: params.offerInfo.offerId,
      name: params.offerInfo.name,
      advertiser: params.offerInfo.advertiser,
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

    let sendObj = {
      _comments: `conversion type ${params.conversionType}`,
      conversion_type: params.conversionType,
      id: params.offerInfo.offerId,
      action: 'update',
      timestamp: Date.now(),
      body: `${JSON.stringify(conversionTypeBody)}`
    }

    consola.info(`Added to SQS Conversion Type Cmp, Body:${JSON.stringify(sendObj)}`)
    let sqsData = await sendMessageToQueue(sendObj)
    params.sendTOSQS = sqsData
    params.sendTOSQSBody = sendObj
    params.sqsUrl = process.env.AWS_SQS_QUEUE_URL || ''
  } catch (e) {
    consola.error('sqs err:', e)
  }

}
