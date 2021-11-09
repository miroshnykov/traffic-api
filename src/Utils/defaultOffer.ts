import {promises as fs} from "fs";
import consola from "consola";
import {getOffer} from "../Models/offersModel";
import {IOffer} from "../Interfaces/offers";
import {REDIRECT_URLS} from "./defaultRedirectUrls";

export enum OFFER_DEFAULT {
  OFFER_ID = 36303
  //OFFER_ID = 35910 // dev
}

export const getDefaultOfferUrl = async () => {
  try {
    const offerDefault: any = await getOffer(OFFER_DEFAULT.OFFER_ID)
    const offerDefaultInfo: IOffer = JSON.parse(offerDefault)
    let offerRedirectUrl = offerDefaultInfo?.landingPageUrl || REDIRECT_URLS.DEFAULT
    let prefix = 'http'

    if (offerRedirectUrl.substr(0, prefix.length) !== prefix) {
      offerRedirectUrl = prefix + '://' + offerRedirectUrl
    }

    return offerRedirectUrl
  } catch (e) {
    consola.error('getDefaultOfferUrlError:', e);
    return REDIRECT_URLS.DEFAULT
  }
}
