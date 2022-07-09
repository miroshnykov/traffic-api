import { offersServices } from '../Services/offersServices';
import { IParams, IResponse } from '../Interfaces/params';

export class OffersController {
  public async getOffer(
    params: IParams,
  ): Promise<IResponse> {
    const responseOffer: IResponse = await offersServices(params);
    return responseOffer;
  }
}
