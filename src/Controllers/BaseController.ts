import {Request, Response, NextFunction} from 'express';

export abstract class BaseController {
  public abstract read(req: Request, res: Response, next: NextFunction): void;
}