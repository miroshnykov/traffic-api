import consola from 'consola';
import { getOffer } from '../Models/offersModel';
import { IOffer } from '../Interfaces/offers';
import { RedirectUrls } from './defaultRedirectUrls';

export enum OfferDefault {
  OFFER_ID = 36303,
  // OFFER_ID = 35910 // dev
}

export const getDefaultOfferUrl = async (): Promise<string> => {
  try {
    const offerDefault: any = await getOffer(OfferDefault.OFFER_ID);
    const offerDefaultInfo: IOffer = JSON.parse(offerDefault);
    let offerRedirectUrl = offerDefaultInfo?.landingPageUrl || RedirectUrls.DEFAULT;
    const prefix = 'http';

    if (offerRedirectUrl.substr(0, prefix.length) !== prefix) {
      offerRedirectUrl = `${prefix}://${offerRedirectUrl}`;
    }

    return offerRedirectUrl;
  } catch (e) {
    consola.error('getDefaultOfferUrlError:', e);
    return RedirectUrls.DEFAULT;
  }
};
