import {Request, Response, NextFunction} from 'express';
import {BaseController} from './BaseController';
import {offersServices} from '../Services/offersServices'
import consola from 'consola'
import {rangeSpeed} from "../Utils/rangeSpped";
import {influxdb} from "../Utils/metrics";
import {IParams} from "../Interfaces/params";
import {REDIRECT_URLS} from "../Utils/defaultRedirectUrls";
import {getDefaultOfferUrl} from "../Utils/defaultOffer";
import {IResponse} from "../Interfaces/params";
import {redirectUrl} from "../Utils/redirectUrl";
import {convertHrtime} from "../Utils/convertHrtime";

export class OffersController extends BaseController {

  public async read(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<IParams | void> {

    const startTime: bigint = process.hrtime.bigint()
    const responseOffer: IResponse = await offersServices(req)
    const endTime: bigint = process.hrtime.bigint()
    const diffTime: bigint = endTime - startTime
    // const timeCurrent: number = new Date().getTime()
    if (responseOffer.data) {

      responseOffer.data.redirectUrl = await redirectUrl(responseOffer.data)
      responseOffer.data.speedTime = convertHrtime(diffTime)
      // const speedTime: number = rangeSpeed(responseOffer.data.speedTime)
      const speedTime: number = rangeSpeed(responseOffer.data.speedTime)
      if (speedTime >= 2000) {
        influxdb(200, `speed_time_more_${speedTime}_ms_country_${responseOffer.data.country}`)
      } else {
        influxdb(200, `speed_time_less_${speedTime}_ms`)
      }
      // influxdb(200, `country_${responseOffer.data.country}`)
      // influxdb(200, `offerId_${responseOffer.data.offerId}`)
      // influxdb(200, `campaignId_${responseOffer.data.campaignId}`)
    }

    if (!responseOffer.success && responseOffer?.debug) {
      const defaultOfferUrl: string = await getDefaultOfferUrl()
      influxdb(200, `default_offer_url`)
      res.status(400).json({
        error: `Recipe is inactive or not ready or broken  ${responseOffer.errors.toString()}, will redirect to default offer:${defaultOfferUrl}`,
        data: responseOffer.data,
        redirect: defaultOfferUrl || ''
      })
      return
    }

    if (!responseOffer?.success) {
      const defaultOfferUrl: string = await getDefaultOfferUrl()
      influxdb(200, `default_offer_url`)
      return res.redirect(defaultOfferUrl)
    }

    if (responseOffer?.success && responseOffer?.debug) {
      consola.info(`redirect to ${responseOffer?.data?.redirectUrl}`)
      res.status(200).json({
        status: 'success',
        data: responseOffer.data
      })
      return
    }

    if (responseOffer?.success) {
      const redirectUrlFinal: string = responseOffer.data?.redirectUrl || REDIRECT_URLS.DEFAULT
      consola.info(`redirect to ${redirectUrlFinal}`)
      influxdb(200, `offers_success_redirect`)
      return res.redirect(redirectUrlFinal)
    }
  }
}