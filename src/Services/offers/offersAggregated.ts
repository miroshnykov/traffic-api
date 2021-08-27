import  {geoRestrictions} from "./geoRestrictions"
import  {customLP} from "./customLp"
import {getOffer} from '../../Models/offersModel'
import {redirectUrl} from "../../Utils/redirectUrl"
import {override} from "./override"

import consola from "consola";

export const offerAggregatedCalculations = async (params:any) => {
  try {
    let pass = false
    params.groupOffer = true
    // Object.keys(offerInfo.offersAggregatedIds).length
    if (params.offerInfo.offersAggregatedIds.length !== 0) {
      let offersAggregatedIds = params.offerInfo.offersAggregatedIds

      params.offersAggregatedIds = offersAggregatedIds
      let offersAggregatedIdsToRedirect = []
      for (const offer of offersAggregatedIds) {

        let offerRestriction = await checkRestrictionsByOffer(offer.aggregatedOfferId, params)
        if (!offerRestriction) {
          offersAggregatedIdsToRedirect.push(+offer.aggregatedOfferId)
        }
      }

      params.offersAggregatedIdsToRedirect = offersAggregatedIdsToRedirect
      if (offersAggregatedIdsToRedirect.length !== 0) {

        // Math.floor(Math.random() * (2 + 1));
        let bestOfferId = offersAggregatedIdsToRedirect[0]

        params.redirectReason = `Offers Aggregated`
        params.redirectType = 'OfferAggregatedBestOffer'
        await override(params, bestOfferId)
        params.groupBestOffer = bestOfferId
        params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
        consola.info(` **** info lid { ${params.lid} } ${JSON.stringify(params.info)}`)
        pass = true

      }
    }
    return pass

  } catch (e) {
    consola.error('offerAggregatedCalculationsError:',e)
  }

}
interface IOfferInfo {
  offerId: number
  campaignId: number
}

const checkRestrictionsByOffer = async (offerId:number, params:any) => {
  let offer = await getOffer(offerId)
  if (!offer) return
  let offerInfo:any = JSON.parse(offer)
  let pass = false
  if (offerInfo.startEndDateSetup) {
    if (!offerInfo.startEndDateSetting.dateRangePass) {
      pass = true
    }
  }
  if (offerInfo.geoRules) {
    let geoRules = JSON.parse(offerInfo.geoRules)
    let resolveGeo = await geoRestrictions(params.country, geoRules.geo)
    if (resolveGeo.length !== 0) {
      pass = true
    }
  }

  if (offerInfo.customLpRules) {

    let customLPRules = JSON.parse(offerInfo.customLpRules)
    let resolveCustomLP = await customLP(params.country, customLPRules.customLPRules)
    if (resolveCustomLP.length !== 0) {
      pass = true
    }
  }

  if (offerInfo.capsClicksOverLimit || offerInfo.capsSalesOverLimit) {
    pass = true
  }

  return pass

}
