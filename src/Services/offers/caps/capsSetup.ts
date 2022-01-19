import consola from 'consola';
import { influxdb } from '../../../Utils/metrics';
import { IBaseResponse, IParams } from '../../../Interfaces/params';
import { IRedirectType } from '../../../Interfaces/recipeTypes';
import { override } from '../../override/override';

export const capsOfferChecking = async (params: IParams): Promise<IBaseResponse> => {
  let paramsClone = { ...params };
  let pass :boolean = false;
  try {
    if (paramsClone.offerInfo?.capInfo?.dateRangeSetUp
      && !paramsClone.offerInfo?.capInfo?.dateRangePass
    ) {
      paramsClone.capsResult.dataRange = `caps offer data range setup  but not Pass  capInfo:${JSON.stringify(paramsClone.offerInfo.capInfo)}`;
      paramsClone.redirectType = IRedirectType.CAPS_OFFER_DATA_RANGE_NOT_PASS;
      paramsClone.capsResult.capsType = paramsClone.offerInfo?.capInfo?.capsType!;
      paramsClone.redirectReason = 'offerCapsDataRangeNotPass';
      paramsClone.capsResult.info = `offer dateRangeSetUp=${paramsClone.offerInfo?.capInfo?.dateRangeSetUp}, dateRangePass=${paramsClone.offerInfo?.capInfo?.dateRangePass}`;
      return {
        success: pass,
        params: paramsClone,
      };
    }

    if (
      paramsClone.offerInfo?.capInfo?.capsSalesOverLimit
      || paramsClone.offerInfo?.capInfo?.capsClicksOverLimit
    ) {
      const paramsOverride = await override(paramsClone, paramsClone.offerInfo?.capInfo.offerCapsOfferIdRedirect!);
      paramsClone = { ...paramsClone, ...paramsOverride };
      paramsClone.redirectType = paramsClone.offerInfo?.redirectType;
      paramsClone.redirectReason = paramsClone.offerInfo?.redirectReason;
      paramsClone.capsResult.capsType = paramsClone.offerInfo?.capInfo?.capsType!;
      paramsClone.capsResult.info = `offers caps capsSalesOverLimit=${paramsClone.offerInfo?.capInfo?.capsSalesOverLimit}  capsClicksOverLimit=${paramsClone.offerInfo?.capInfo?.capsClicksOverLimit}`;
      pass = true;
    } else if (
      paramsClone.offerInfo?.capInfo?.capsSalesUnderLimit
      || paramsClone.offerInfo?.capInfo?.capsClicksUnderLimit
    ) {
      paramsClone.redirectType = IRedirectType.CAPS_OFFER_UNDER_LIMIT;
      paramsClone.redirectReason = 'offer caps sales or clicks under limit ';
      paramsClone.capsResult.capsType = paramsClone.offerInfo?.capInfo?.capsType!;
      paramsClone.capsResult.info = `offers caps capsSalesUnderLimit=${paramsClone.offerInfo?.capInfo?.capsSalesUnderLimit}, capsClicksUnderLimit=${paramsClone.offerInfo?.capInfo?.capsClicksUnderLimit}`;
      pass = true;
    }

    influxdb(200, `offer_cap_${paramsClone.redirectType}`);
    return {
      success: pass,
      params: paramsClone,
    };
  } catch (e) {
    consola.error('capsOfferCheckingError:', e);
    return {
      success: pass,
      params: paramsClone,
    };
  }
};
