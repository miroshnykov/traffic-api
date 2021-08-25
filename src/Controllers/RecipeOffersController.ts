import {Request, Response, NextFunction} from 'express';
import {BaseController} from './BaseController';
import {recipeOffersServices} from '../Services/recipeOffersServises'
import consola from 'consola'

export class RecipeOffersController extends BaseController {

  public async read(req: Request, res: Response, next: NextFunction): Promise<any> {
    const offerId: number = +req.query.offerId! || 0
    let responseOffer = await recipeOffersServices(offerId)
    consola.info('responseOffer:', responseOffer)
    consola.info(req.query)

    if (req.query.debug !== 'debug') {
      res.status(400).json({
        status: 'error',
        error: 'body  empty'
      })
      return next()
    }

    res.status(200).json({
      status: 'success',
      data: JSON.parse(responseOffer!)
    });
  }
}