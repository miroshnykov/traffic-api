import { Request, Response, NextFunction } from 'express';
import consola from 'consola';
import md5 from 'md5';
import { BaseController } from './BaseController';
import { getFp, setFp } from '../Models/fpModel';
import { getLeadData, redshiftOffer } from '../Utils/dynamoDb';
import { IRedshiftData } from '../Interfaces/redshiftData';
import { influxdb } from '../Utils/metrics';

interface ILidResponse {
  success: boolean;
  lid: string;
  message?: string
  errors?: string
}

export class LidController extends BaseController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async read(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { lid } = req.body;
    const { hash } = req.body;
    const { timestamp } = req.body;
    let response: ILidResponse;
    try {
      const secret = process.env.GATEWAY_API_SECRET;
      const checkHash = md5(`${timestamp}|${secret}`);

      if (checkHash !== hash) {
        response = {
          success: false,
          lid,
          errors: 'Broken hash',
        };
        res.status(200).json(response);
        return;
      }
      const lidCache = await getFp(lid);
      if (lidCache) {
        response = {
          success: false,
          lid,
          errors: 'LID already added',
        };
        res.status(200).json(response);
        return;
      }
      const respLid: any = await getLeadData(lid);
      if (respLid) {
        await setFp(lid, lid);
        const stats: IRedshiftData = redshiftOffer(respLid);

        if (process.send) {
          process.send({
            type: 'clickOffer',
            value: 1,
            stats,
          });
        }
      } else {
        response = {
          success: false,
          lid,
          errors: 'Lid does not exists in dynamodb',
        };
        res.status(200).json(response);
        return;
      }

      response = {
        success: true,
        lid,
        message: 'Lid successfully added to queue',
      };
      influxdb(200, 'lid_add_redshift_success');

      res.status(200).json(response);
    } catch (e) {
      influxdb(500, 'lid_add_redshift_error');
      const errMessage = (e.response
        && e.response.data
        && e.response.data.message)
      || e.message
      || e.toString();
      consola.error('LidAddRedshiftError:', errMessage);

      response = {
        success: false,
        lid,
        errors: errMessage,
      };
      res.status(500).json(response);
    }
  }
}
