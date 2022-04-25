import {
  Router, Request, Response, NextFunction,
} from 'express';
// eslint-disable-next-line import/no-cycle
import { recipeController } from '../Controllers';

const recipeRouter = Router();

recipeRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await recipeController.read(req, res, next);
});

export default recipeRouter;
