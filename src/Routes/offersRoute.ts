import {
  Router, Request, Response, NextFunction,
} from 'express';
// eslint-disable-next-line import/no-cycle
import { offerController } from '../Controllers';

const offersRouter = Router();

offersRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  await offerController.read(req, res, next);
});

export default offersRouter;
