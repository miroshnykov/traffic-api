import { ICapInfo } from './caps';

export interface ICampaign {
  campaignId: number,
  name: string
  offerId: number
  affiliateId: number
  affiliateStatus: string
  campaignStatus: string
  capSetup?: boolean
  capInfo?: ICapInfo
  payout: number
  payoutPercent: number
  affiliateManagerId: number
  targetRules?: object[]
}

export enum ICampaignStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  PENDING = 'pending',
  BLOCKED = 'blocked',
  REJECTED = 'rejected',
}
