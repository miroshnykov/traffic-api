import { Request, Response, NextFunction } from 'express';
import consola from 'consola';
import { BaseController } from './BaseController';
import { offersServices } from '../Services/offersServices';
import { rangeSpeed } from '../Utils/rangeSpped';
import { influxdb } from '../Utils/metrics';
import { IParams, IResponse } from '../Interfaces/params';
import { RedirectUrls } from '../Utils/defaultRedirectUrls';
import { getDefaultOfferUrl, OfferDefault } from '../Utils/defaultOffer';
import { redirectUrl } from '../Utils/redirectUrl';
import { convertHrtime } from '../Utils/convertHrtime';

export class OffersController extends BaseController {
  public async read(
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ): Promise<IParams | void> {
    const startTime: bigint = process.hrtime.bigint();
    const responseOffer: IResponse = await offersServices(req);
    const endTime: bigint = process.hrtime.bigint();
    const diffTime: bigint = endTime - startTime;
    // const timeCurrent: number = new Date().getTime()
    if (responseOffer.params) {
      responseOffer.params.redirectUrl = await redirectUrl(responseOffer.params);
      responseOffer.params.speedTime = convertHrtime(diffTime);
      // const speedTime: number = rangeSpeed(responseOffer.data.speedTime)
      const speedTime: number = rangeSpeed(responseOffer.params.speedTime);
      if (speedTime >= 2000) {
        influxdb(200, `speed_time_more_${speedTime}_ms_country_${responseOffer.params.country}`);
      } else {
        influxdb(200, `speed_time_less_${speedTime}_ms`);
      }
      // influxdb(200, `country_${responseOffer.data.country}`)
      // influxdb(200, `offerId_${responseOffer.data.offerId}`)
      // influxdb(200, `campaignId_${responseOffer.data.campaignId}`)
    }

    if (!responseOffer.success && responseOffer?.debug) {
      const defaultOfferUrl: string = await getDefaultOfferUrl();
      res.status(400).json({
        error: `Recipe is inactive or not ready or broken  ${responseOffer?.errors?.toString()}, will redirect to default offer:${defaultOfferUrl}`,
        data: responseOffer.params,
        redirect: defaultOfferUrl || '',
      });
      return;
    }

    if (!responseOffer?.success) {
      const defaultOfferUrl: string = await getDefaultOfferUrl();
      influxdb(200, 'offers_default_redirect_by_error');
      consola.error(`Recipe is inactive or not ready or broken  ${responseOffer?.errors?.toString()}, will redirect to default offer:${defaultOfferUrl}`);
      res.redirect(defaultOfferUrl);
    }

    if (responseOffer?.success && responseOffer?.debug) {
      consola.info(`Redirect to ${responseOffer?.params?.redirectUrl}`);
      consola.info(`CampaignId: { ${responseOffer.params?.campaignId} } OfferId: { ${responseOffer.params?.offerId} } PayIn: { ${responseOffer.params?.payIn} } PayOut: { ${responseOffer.params?.payOut} } redirectType { ${responseOffer.params?.redirectType} } redirectReason { ${responseOffer.params?.redirectReason} }`);

      if (responseOffer.params?.offerId === OfferDefault.OFFER_ID) {
        consola.info('Offers_default_redirect');
      }
      res.status(200).json({
        status: 'success',
        data: responseOffer.params,
      });
      return;
    }

    if (responseOffer?.success) {
      const redirectUrlFinal: string = responseOffer.params?.redirectUrl || RedirectUrls.DEFAULT;
      consola.info(`Redirect to ${redirectUrlFinal}`);
      consola.info(`CampaignId: { ${responseOffer.params?.campaignId} } OfferId: { ${responseOffer.params?.offerId} } PayIn: { ${responseOffer.params?.payIn} } PayOut: { ${responseOffer.params?.payOut} }  redirectType { ${responseOffer.params?.redirectType} } redirectReason { ${responseOffer.params?.redirectReason} }`);
      if (responseOffer.params?.offerId === OfferDefault.OFFER_ID) {
        influxdb(200, 'offers_default_redirect');
      } else {
        influxdb(200, 'offers_success_redirect');
      }
      res.redirect(redirectUrlFinal);
    }
  }
}
