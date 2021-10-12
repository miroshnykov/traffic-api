import {Router, Request, Response, NextFunction} from 'express';

const recipeRouter = Router();
import {recipeController} from '../Controllers';

recipeRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await recipeController.read(req, res, next)
});

export default recipeRouter;

