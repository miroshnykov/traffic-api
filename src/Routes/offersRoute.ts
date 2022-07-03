import {
  Router, Request, Response,
} from 'express';
// eslint-disable-next-line import/no-cycle
import consola from 'consola';
// eslint-disable-next-line import/no-cycle
import { offerController } from '../Controllers';
import { redirectUrl } from '../Utils/redirectUrl';
import { convertHrtime } from '../Utils/convertHrtime';
import { rangeSpeed } from '../Utils/rangeSpped';
import { influxdb } from '../Utils/metrics';
import { OfferDefault } from '../Utils/defaultOffer';
import { RedirectUrls } from '../Utils/defaultRedirectUrls';
import { IParams, IResponse } from '../Interfaces/params';
import { getParams } from '../Services/params';

const offersRouter = Router();

offersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime: bigint = process.hrtime.bigint();
    const params: IParams = await getParams(req);

    const responseOffer: IResponse = await offerController.getOffer(params);
    const endTime: bigint = process.hrtime.bigint();
    const diffTime: bigint = endTime - startTime;
    // const timeCurrent: number = new Date().getTime()

    if (responseOffer?.block && responseOffer?.debug) {
      res.status(404).json({
        status: '404 Campaign not found',
        reason: responseOffer?.blockReason,
      });
      return;
    }

    if (responseOffer?.block) {
      res.status(404).json('404 Campaign not found');
      // res.status(403).json({
      //   status: 'forbidden',
      //   reason: responseOffer?.blockReason,
      // });
      return;
    }
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
    if (!responseOffer?.success && responseOffer?.debug) {
      influxdb(200, 'blocked_by_error');
      res.status(404).json({
        status: '404 Campaign not found',
        reason: responseOffer,
      });
      return;
    }

    if (!responseOffer?.success) {
      influxdb(200, 'blocked_by_error');
      consola.error(`Recipe is inactive or not ready or broken  ${responseOffer?.errors?.toString()}`);
      res.status(404).json('404 Campaign not found');
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
  } catch (e) {
    influxdb(500, 'offers_router_error');
    consola.error(`offersRouter Errors: ${e.toString()}`);
    res.status(500).json(e.toString());
  }
});

export default offersRouter;
