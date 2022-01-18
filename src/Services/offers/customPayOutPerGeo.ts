import consola from 'consola';
import { IBaseResponse, IParams } from '../../Interfaces/params';
import { ICustomPayOutPerGeo } from '../../Interfaces/customPayOutPerGeo';
import { IRedirectType } from '../../Interfaces/recipeTypes';

export const customPayOutPerGeo = (params: IParams): IBaseResponse => {
  let pass = false;
  const paramsClone = { ...params };
  const customPayOutPerGeoData: ICustomPayOutPerGeo[] = JSON.parse(paramsClone.offerInfo?.customPayOutPerGeo!);
  const [checkCustomPerGeo] = customPayOutPerGeoData.filter((i: any) => (i.geo === paramsClone.country));
  consola.info('checkCustomPerGeo:', checkCustomPerGeo);
  if (checkCustomPerGeo) {
    // eslint-disable-next-line no-param-reassign,prefer-destructuring
    paramsClone.customPayOutPerGeo = checkCustomPerGeo;

    paramsClone.redirectReason = `customPayoutByGeo-${JSON.stringify(checkCustomPerGeo)}`;
    paramsClone.redirectType = IRedirectType.CUSTOM_PAY_OUT_PER_GEO;
    paramsClone.payOut = checkCustomPerGeo.payOut;
    paramsClone.payIn = checkCustomPerGeo.payIn;

    pass = true;
  }
  return {
    success: pass,
    params: paramsClone,
  };
};
