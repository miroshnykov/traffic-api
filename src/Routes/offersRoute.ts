import {
  Router, Request, Response, NextFunction,
} from 'express';
import { offerController } from '../Controllers';

const offersRouter = Router();

offersRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await offerController.read(req, res, next);
});

export default offersRouter;
