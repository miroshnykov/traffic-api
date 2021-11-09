import {Request, Response, NextFunction} from 'express';
import {BaseController} from './BaseController';
import {offersServices} from '../Services/offersServices'
import consola from 'consola'
import {rangeSpeed} from "../Utils/rangeSpped";
import {influxdb} from "../Utils/metrics";
import {IParams} from "../Interfaces/params";
import {REDIRECT_URLS} from "../Utils/defaultRedirectUrls";
import {getDefaultOfferUrl} from "../Utils/defaultOffer";

interface IResOffer {
  success: boolean;
  data?: IParams;
  errors?: any;
  debug?: boolean;
}

export class OffersController extends BaseController {

  public async read(req: Request, res: Response, next: NextFunction): Promise<any> {
    let responseOffer: IResOffer = await offersServices(req)
    // consola.info('responseOffer:', responseOffer)
    // consola.info(req.query)

    let timeCurrent: number = new Date().getTime()
    if (responseOffer.data) {
      responseOffer.data.speedTime = timeCurrent - responseOffer.data?.startTime
      let speedTime = rangeSpeed(responseOffer.data.speedTime)
      if (speedTime >= 2500) {
        influxdb(200, `speed_time_more_${speedTime}_ms_country_${responseOffer.data.country}`)
      } else {
        influxdb(200, `speed_time_less_${speedTime}_ms`)
      }
      influxdb(200, `country_${responseOffer.data.country}`)
      influxdb(200, `offerId_${responseOffer.data.offerId}`)
      influxdb(200, `campaignId_${responseOffer.data.campaignId}`)
    }

    if (!responseOffer.success && responseOffer?.debug) {
      let defaultOfferUrl = await getDefaultOfferUrl()
      influxdb(200, `default_offer_url`)
      res.status(400).json({
        error: `Recipe is inactive or not ready or broken  ${responseOffer.errors.toString()}, will redirect to default offer:${defaultOfferUrl}`,
        data: responseOffer.data,
        redirect: defaultOfferUrl || ''
      })
      return next()
    }

    if (!responseOffer?.success) {
      // some errors redirect to default offer url
      const defaultOfferUrl:string = await getDefaultOfferUrl()
      influxdb(200, `default_offer_url`)
      res.redirect(defaultOfferUrl)
      return next()
    }

    if (responseOffer?.success && responseOffer?.debug) {
      res.status(200).json({
        status: 'success',
        data: responseOffer.data
      })
      return next()
    }

    if (responseOffer?.success) {
      const redirectUrl: string = responseOffer.data?.redirectUrl || REDIRECT_URLS.DEFAULT
      consola.info(`redirect to ${redirectUrl}`)
      res.redirect(redirectUrl)
      return next()
    }

  }
}