import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { recipeOffersServices } from '../Services/recipeOffersServices';
import { recipeCampaignsServices } from '../Services/recipeCampaignsServices';

import { getOfferSize } from '../Models/offersModel';
import { getCampaignSize } from '../Models/campaignsModel';
import { getFp, setFp } from '../Models/fpModel';
import { getLeadData, redshiftOffer } from '../Utils/dynamoDb';
import { IRedshiftData } from '../Interfaces/redshiftData';

interface IRecipeResponse {
  offer?: object;
  campaign?: object;
  offerSize?: number;
  campaignSize?: number;
  fpResult?: string;
  fpCache?: boolean;
  resendLid?: any;
}

export class RecipeController extends BaseController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async read(req: Request, res: Response, next: NextFunction): Promise<any> {
    const offerId: number = +req.query.offerId! || 0;
    const campaignId: number = +req.query.campaignId! || 0;
    const isResendLid: string = String(req.query.resendLid!) || '';
    const lid: string = String(req.query.lid!) || '';

    const fp: string = String(req.query.fp! || '');
    const responseOffer = await recipeOffersServices(offerId);
    const responseCampaign = await recipeCampaignsServices(campaignId);
    const offerSize: number = await getOfferSize() || 0;
    const campaignSize: number = await getCampaignSize() || 0;
    const fpResult: string = await getFp(fp) || '';
    let fpCache: boolean = true;
    let resendLid: any;

    if (isResendLid === 'yes' && lid) {
      const lidCache = await getFp(lid);
      if (lidCache) {
        resendLid = 'already added';
      } else {
        const respLid: any = await getLeadData(lid);
        if (respLid) {
          resendLid = respLid;
          await setFp(lid, lid);
          respLid.event = 'traffic-manually';
          const stats: IRedshiftData = redshiftOffer(respLid);

          if (process.send) {
            process.send({
              type: 'clickOffer',
              value: 1,
              stats,
            });
          }
        } else {
          resendLid = `no lid: { ${lid} } in DB `;
        }
      }
    }

    if (!fpResult) {
      await setFp(fp, fp);
      fpCache = false;
    }
    if (req.query.debugging !== 'debugging') {
      res.status(400).json({
        status: 'error',
        error: 'body empty',
      });
      return;
    }

    const response: IRecipeResponse = {
      offer: JSON.parse(responseOffer!),
      campaign: JSON.parse(responseCampaign!),
      offerSize,
      campaignSize,
      fpResult,
      fpCache,
      resendLid,
    };

    res.status(200).json({
      status: 'success',
      data: response,
    });
  }
}
