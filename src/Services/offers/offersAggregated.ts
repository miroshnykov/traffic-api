import {geoRestrictions} from "./geoRestrictions"
import {customLP} from "./customLp"
import {getOffer} from '../../Models/offersModel'
import {redirectUrl} from "../../Utils/redirectUrl"
import {override} from "./override"

import consola from "consola";
import {IParams} from "../../Interfaces/params";
import {IOffer} from "../../Interfaces/offers";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const offerAggregatedCalculations = async (params: IParams) => {
  try {
    let pass = false
    params.groupOffer = true
    // Object.keys(offerInfo.offersAggregatedIds).length

    if (params.offerInfo?.offersAggregatedIds?.length !== 0) {
      let offersAggregatedIds = params.offerInfo?.offersAggregatedIds || []

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
        params.redirectType = IRedirectType.OFFER_AGGREGATED_BEST_OFFER
        await override(params, bestOfferId)
        params.groupBestOffer = bestOfferId
        params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
        pass = true

      }
    }
    return pass

  } catch (e) {
    consola.error('offerAggregatedCalculationsError:', e)
    return false
  }

}

const checkRestrictionsByOffer = async (offerId: number, params: IParams) => {
  try {
    let offer = await getOffer(offerId)
    if (!offer) return
    let offerInfo: IOffer = JSON.parse(offer)
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

    if (offerInfo.capInfo?.capsClicksOverLimit || offerInfo.capInfo?.capsSalesOverLimit) {
      pass = true
    }

    return pass
  } catch (e) {
    consola.error('checkRestrictionsByOffer:', e)
  }

}
