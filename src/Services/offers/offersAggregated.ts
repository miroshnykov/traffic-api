import {geoRestrictions} from "./geoRestrictions"
import {customLP} from "./customLp"
import {getOffer} from '../../Models/offersModel'
import {redirectUrl} from "../../Utils/redirectUrl"
import {override} from "./override"

import consola from "consola";
import {IParams} from "../../Interfaces/params";
import {IAggregatedOfferList, IOffer} from "../../Interfaces/offers";
import {IRedirectType} from "../../Interfaces/recipeTypes";

export const offerAggregatedCalculations = async (params: IParams) => {
  try {
    let pass: boolean = false

    if (params.offerInfo?.offersAggregatedIds?.length !== 0) {
      params.groupOffer = true
      let offersAggregatedIds = params.offerInfo?.offersAggregatedIds || []

      params.offersAggregatedIds = offersAggregatedIds
      let offersAggregatedIdsToRedirect: number[] = []
      for (const offer of offersAggregatedIds) {

        const offerRestrictionPass: boolean = await checkRestrictionsByOffer(offer, params)
        if (offerRestrictionPass) {
          offersAggregatedIdsToRedirect.push(+offer.aggregatedOfferId)
        }
      }

      params.offersAggregatedIdsToRedirect = offersAggregatedIdsToRedirect
      if (offersAggregatedIdsToRedirect.length !== 0) {

        let bestOfferId: number = offersAggregatedIdsToRedirect[0]

        //PH-38
        const checkMargin = offersAggregatedIds.filter(i => i.aggregatedOfferId === bestOfferId)[0]
        const checkDuplicateMargin = offersAggregatedIds.filter(i => i.margin === checkMargin.margin
            && offersAggregatedIdsToRedirect.includes(i.aggregatedOfferId)
        )
        params.offersAggregatedIdsMargin = checkDuplicateMargin
        if (checkDuplicateMargin.length > 1) {
          const duplicateMarginIds = checkDuplicateMargin.map(i => i.aggregatedOfferId)
          const randomId = Math.floor(Math.random() * duplicateMarginIds.length);
          bestOfferId = duplicateMarginIds[randomId]
        }

        params.redirectReason = `Offers Aggregated`
        params.redirectType = IRedirectType.OFFER_AGGREGATED_BEST_OFFER
        await override(params, bestOfferId)
        params.groupBestOffer = bestOfferId
        params.redirectUrl = await redirectUrl(params.landingPageUrl, params)
        pass = true

      } else {
        params.redirectReason = `Offers Aggregated exit traffic`
        params.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC
        await override(params, params.offerInfo?.offerIdRedirectExitTraffic)
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

const checkRestrictionsByOffer = async (offer: IAggregatedOfferList, params: IParams) => {
  try {

    return !(offer?.capsOverLimitClicks
      || offer?.capsOverLimitSales
      || offer?.dateRangeNotPass
      || offer?.countriesRestrictions && offer?.countriesRestrictions.includes(params.country)
      || offer?.customLpCountriesRestrictions && offer?.customLpCountriesRestrictions.includes(params.country))


  } catch (e) {
    consola.error('checkRestrictionsByOffer:', e)
    return false
  }

}
