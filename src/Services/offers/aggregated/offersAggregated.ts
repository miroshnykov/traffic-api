import consola from 'consola';
// eslint-disable-next-line import/no-cycle
import { override } from '../../override/override';
// eslint-disable-next-line import/no-cycle
import {
  IBestOffer, IBaseResponse, IParams,
} from '../../../Interfaces/params';
import { IRedirectType } from '../../../Interfaces/recipeTypes';

import { identifyBestOffer } from './identifyBestOffer';

export const offerAggregatedCalculations = async (
  params: IParams,
): Promise<IBaseResponse> => {
  let paramsClone = { ...params };
  let pass: boolean = false;
  let paramsOverride: IParams;
  try {
    if (paramsClone.offerInfo?.offersAggregatedIds?.length !== 0) {
      paramsClone.groupOffer = true;

      const offersAggregatedIds = paramsClone.offerInfo?.offersAggregatedIds!;

      const bestOfferRes: IBestOffer = await identifyBestOffer(offersAggregatedIds, paramsClone);
      if (bestOfferRes.success && bestOfferRes.bestOfferId) {
        paramsClone.redirectReason = 'Offers Aggregated';
        paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_BEST_OFFER;
        paramsClone.groupBestOffer = bestOfferRes.bestOfferId;
        paramsOverride = await override(paramsClone, bestOfferRes.bestOfferId);
        paramsClone = { ...paramsClone, ...paramsOverride };
        paramsClone.offersAggregatedIdsToRedirect = bestOfferRes?.params?.offersAggregatedIdsToRedirect;
        paramsClone.offersAggregatedIdsProportionals = bestOfferRes?.params?.offersAggregatedIdsProportionals;
        paramsClone.offersAggregatedIdsMargin = bestOfferRes?.params?.offersAggregatedIdsMargin;
        pass = true;
      } else {
        paramsClone.redirectReason = 'Offers Aggregated exit traffic to regular offer';
        paramsClone.redirectType = IRedirectType.OFFER_AGGREGATED_EXIT_TRAFFIC_TO_REGULAR_OFFER;
        paramsOverride = await override(paramsClone, paramsClone.offerInfo?.offerIdRedirectExitTraffic);
        paramsClone = { ...paramsClone, ...paramsOverride };
        pass = true;
      }
    }

    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('offerAggregatedCalculationsError:', e);

    return {
      success: pass,
      params: paramsClone,
    };
  }
};
