import url from "url";

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

  // if (params.conversionType === 'cpm') {
  //   await sqsConversionTypeCmp(params)
  // }


  return urlToRedirect
}
