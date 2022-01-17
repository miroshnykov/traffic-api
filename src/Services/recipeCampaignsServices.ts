import { getCampaign } from '../Models/campaignsModel';

export const recipeCampaignsServices = async (id: number) => (getCampaign(id));
