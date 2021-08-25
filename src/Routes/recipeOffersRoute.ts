import {Router, Request, Response, NextFunction} from 'express';

const recipeOffersRouter = Router();
import {recipeOfferController} from '../Controllers';

recipeOffersRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await recipeOfferController.read(req, res, next)
});

export default recipeOffersRouter;

