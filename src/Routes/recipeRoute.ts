import {
  Router, Request, Response, NextFunction,
} from 'express';
import { recipeController } from '../Controllers';

const recipeRouter = Router();

recipeRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await recipeController.read(req, res, next);
});

export default recipeRouter;
