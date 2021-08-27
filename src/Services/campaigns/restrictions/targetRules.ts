// const {override} = require('../../offers/override')
// const metrics = require('./../../../metrics')
// const config = require('plain-config')()
// const logger = require('bunyan-loader')(config.log).child({scope: 'offersStartEndDateSetup.js'})
// const {
//   redirectUrl,
// } = require('./../../utils')
// const {resolveRules} = require('../../offers/rulesResolve')
//
// export const campaignsTargetRules = async (offerInfo, campaignInfo, params) => {
//   try {
//     let pass = false
//     let resolveCampaignRules = await resolveRules(params, campaignInfo.targetRules)
//     if (resolveCampaignRules.length !== 0) {
//       params.redirectType = 'campaignTargetRules'
//       params.redirectReason = `campaignTargetRules-${JSON.stringify(resolveCampaignRules)}`
//
//       await override(offerInfo, offerInfo.offerIdRedirectExitTraffic, params)
//       params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
//       metrics.influxdb(200, `campaignTargetRules`)
//       logger.info(` **** info lid { ${params.lid} } ${JSON.stringify(params.info)}`)
//
//       pass = true
//     }
//
//     return pass
//
//   } catch (e) {
//     logger.error('campaignsTargetRulesError:', e)
//   }
// }
//
