import {
  Router, Request, Response, NextFunction,
} from 'express';
// eslint-disable-next-line import/no-cycle
import { lidController } from '../Controllers';

const recipeRouter = Router();

recipeRouter.post('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await lidController.read(req, res, next);
});

export default recipeRouter;
