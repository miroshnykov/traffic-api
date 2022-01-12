import {override} from "../override/override"
import consola from "consola";
import {IParams} from "../../Interfaces/params";
import {IAggregatedOfferList, IOffer, IOfferType} from "../../Interfaces/offers";
import {IRedirectType} from "../../Interfaces/recipeTypes";
import {getOffer} from "../../Models/offersModel";

export const offerAggregatedCalculations = async (
  params: IParams
): Promise<boolean> => {
  try {
    let pass: boolean = false

    if (params.offerInfo?.offersAggregatedIds?.length !== 0) {
      params.groupOffer = true

      const offersAggregatedIds = params.offerInfo?.offersAggregatedIds!

      const bestOfferId = identifyBestOffer(offersAggregatedIds, params)
      if (bestOfferId) {

        params.redirectReason = `Offers Aggregated`
        params.redirectType = IRedirectType.OFFER_AGGREGATED_BEST_OFFER
        await override(params, bestOfferId)
        params.groupBestOffer = bestOfferId
        pass = true

      } else {
        params.redirectReason = `Offers Aggregated exit traffic to regular offer`
        params.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_REGULAR_OFFER
        await override(params, params.offerInfo?.offerIdRedirectExitTraffic)
        pass = true
      }
    }
    return pass

  } catch (e) {
    consola.error('offerAggregatedCalculationsError:', e)
    return false
  }
}

export const identifyBestOffer = (
  offersAggregatedIds: IAggregatedOfferList[],
  params: IParams
): number => {

  let bestOfferResp: number = 0
  params.offersAggregatedIds = offersAggregatedIds
  let offersAggregatedIdsToRedirect: number[] = []
  for (const offer of offersAggregatedIds) {

    const offerRestrictionPass: boolean = checkRestrictionsByOffer(offer, params.country)
    if (offerRestrictionPass) {
      offersAggregatedIdsToRedirect.push(+offer.aggregatedOfferId)
    }
  }

  params.offersAggregatedIdsToRedirect = offersAggregatedIdsToRedirect
  if (offersAggregatedIdsToRedirect.length !== 0) {

    bestOfferResp = offersAggregatedIdsToRedirect[0]

    //PH-38
    const checkMargin = offersAggregatedIds.filter((i: IAggregatedOfferList) => i.aggregatedOfferId === bestOfferResp)[0]
    const checkDuplicateMargin = offersAggregatedIds.filter((i: IAggregatedOfferList) => i.margin === checkMargin.margin
      && offersAggregatedIdsToRedirect.includes(i.aggregatedOfferId)
    )
    params.offersAggregatedIdsMargin = checkDuplicateMargin
    if (checkDuplicateMargin.length > 1) {
      const duplicateMarginIds = checkDuplicateMargin.map((i: IAggregatedOfferList) => i.aggregatedOfferId)
      const randomId = Math.floor(Math.random() * duplicateMarginIds.length);
      bestOfferResp = duplicateMarginIds[randomId]
    }
  }
  return bestOfferResp
}

const checkRestrictionsByOffer = (
  offer: IAggregatedOfferList,
  country: string
): boolean => {
  try {

    return !(offer?.capsOverLimitClicks
      || offer?.capsOverLimitSales
      || offer?.dateRangeNotPass
      || offer?.countriesRestrictions && offer?.countriesRestrictions.includes(country))
    // || offer?.customLpCountriesRestrictions && offer?.customLpCountriesRestrictions.includes(params.country))


  } catch (e) {
    consola.error('checkRestrictionsByOffer:', e)
    return false
  }

}
