import {Router, Request, Response, NextFunction} from 'express';

const offersRouter = Router();
import {offerController} from '../Controllers';

offersRouter.get('/', async (req: Request, res: Response, next:NextFunction): Promise<any> => {
  await offerController.read(req, res, next)
});

export default offersRouter;

