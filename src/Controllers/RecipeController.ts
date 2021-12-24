import {Request, Response, NextFunction} from 'express';
import {BaseController} from './BaseController';
import {recipeOffersServices} from '../Services/recipeOffersServices'
import {recipeCampaignsServices} from '../Services/recipeCampaignsServices'

import {getOfferSize} from '../Models/offersModel'
import {getCampaignSize} from '../Models/campaignsModel'
import {getFp, setFp} from '../Models/fpModel'

interface IRecipeResponse {
  offer?: object;
  campaign?: object;
  offerSize?: number;
  campaignSize?: number;
  fpResult?: string;
  fpCache?: boolean;
}

export class RecipeController extends BaseController {

  public async read(req: Request, res: Response, next: NextFunction): Promise<any> {
    const offerId: number = +req.query.offerId! || 0
    const campaignId: number = +req.query.campaignId! || 0

    const fp: string = String(req.query.fp! || '')
    let responseOffer = await recipeOffersServices(offerId)
    let responseCampaign = await recipeCampaignsServices(campaignId)
    let offerSize: number = await getOfferSize() || 0
    let campaignSize: number = await getCampaignSize() || 0
    let fpResult: string = await getFp(fp) || ''
    let fpCache: boolean = true

    if (!fpResult) {
      await setFp(fp, fp)
      fpCache = false
    }
    if (req.query.debugging !== 'debugging') {
      res.status(400).json({
        status: 'error',
        error: 'body empty'
      })
      return
    }

    const response: IRecipeResponse = {
      offer: JSON.parse(responseOffer!),
      campaign: JSON.parse(responseCampaign!),
      offerSize,
      campaignSize,
      fpResult,
      fpCache,
    }

    res.status(200).json({
      status: 'success',
      data: response
    });
  }
}