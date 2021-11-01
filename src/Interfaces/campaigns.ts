import {ICapInfo} from "./caps";

export interface ICampaign {
  campaignId: number,
  name: string
  offerId: number
  affiliateId: number
  capSetup?: boolean
  capInfo?: ICapInfo
  payout: number
  payoutPercent: number
  affiliateManagerId: number
  targetRules?:object[]
}
