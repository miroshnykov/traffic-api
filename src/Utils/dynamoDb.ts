import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";
import consola from "consola";

dotenv.config();

export const createLidOffer = async (lidInfo: any) => {
  try {
    // const dynamoDbConf = {
    //   region: process.env.AWS_DYNAMODB_REGION,
    //   endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   tableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // }

    const dynamoDbConf = {
      region: process.env.AWS_DYNAMODB_REGION,
    }

    const ddbClient = new DynamoDBClient(dynamoDbConf);
    let YearPlusOne = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    lidInfo['ttl'] = YearPlusOne.getTime()

    // for (const key in lidInfo) {
    //   if (!lidInfo[key]) {
    //     delete lidInfo[key]
    //   }
    // }
    let stats = redshiftOffer(lidInfo)

    // @ts-ignore
    process.send({
      type: 'clickOffer',
      value: 1,
      stats: stats
    });
    let leadParams = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Item: lidInfo
    }
    const data = await ddbClient.send(new PutCommand(leadParams));
    // console.log("Success - item added or updated", data);
  } catch (e) {
    consola.error(e)
  }
}

const redshiftOffer = (lidObj: any) => (
  {
    'lid': lidObj.lid,
    'affiliate_id': +lidObj.affiliateId || 0,
    'campaign_id': +lidObj.campaignId || 0,
    'offer_id': +lidObj.offerId || 0,
    'landing_page': lidObj.landingPage || '',
    'landing_page_id': +lidObj.landingPageId || 0,
    'payin': lidObj.payin || 0,
    'payout': lidObj.payout || 0,
    'geo': lidObj.country || '',
    'cap_override_offer_id': lidObj.capOverrideOfferId || 0,
    'landing_page_id_origin': 0,
    'landing_page_url_origin': lidObj.landingPageUrlOrigin || 0,
    'advertiser_id': +lidObj.advertiserId || '',
    'advertiser_manager_id': +lidObj.advertiserManagerId || '',
    'affiliate_manager_id': +lidObj.affiliateManagerId || '',
    'referred_advertiser_id': +lidObj.referredAdvertiserId || 0,
    'referred_conversion_type': lidObj.referredAdvertiserName || '',
    'referred_is_cpm_option_enabled': lidObj.referredIsCpmOptionEnabled || null,
    'referred_offer_id': +lidObj.referredOfferId || 0,
    'referred_vertical_id': +lidObj.referredVerticalId || 0,
    'verticals': lidObj.verticalId || '',
    'conversion_type': lidObj.conversionType || '',
    'device': lidObj.device || '',
    'os': lidObj.os || '',
    'isp': lidObj.isp || '',
    'date_added': new Date().getTime(),
    'click': 1,
  }
)

