import { Request, Response, NextFunction } from 'express';
import consola from 'consola';
import md5 from 'md5';
import { BaseController } from './BaseController';
import { getFp, setFp } from '../Models/fpModel';
import { getLeadData, redshiftOffer } from '../Utils/dynamoDb';
import { IRedshiftData } from '../Interfaces/redshiftData';
import { influxdb } from '../Utils/metrics';
import { sendBonusLidToAggregator } from '../Utils/aggregator';

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
      influxdb(200, 'lid_add_redshift_all_request');
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

        const responseAggr = await sendBonusLidToAggregator(stats);

        if (responseAggr.success) {
          response = {
            success: true,
            lid,
            message: 'Lid successfully created in redshift',
          };
          influxdb(200, 'lid_add_redshift_success');
          res.status(200).json(response);
          return;
        }
        response = {
          success: false,
          lid,
          message: 'Lid does not created on aggragator site for some reason',
          errors: responseAggr.errors,
        };
        influxdb(200, 'lid_add_redshift_not_success');
        res.status(200).json(response);
        return;

        // if (process.send) {
        //   process.send({
        //     type: 'clickOffer',
        //     value: 1,
        //     stats,
        //   });
        // }
      }
      response = {
        success: false,
        lid,
        errors: 'Lid does not exists in dynamodb',
      };
      influxdb(200, 'lid_add_redshift_does_not_exists_dynamo_db');
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
