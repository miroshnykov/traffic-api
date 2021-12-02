import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand} from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";
import consola from "consola";
import {influxdb} from "./metrics";
import {IParams} from "../Interfaces/params";
import {IRedshiftData} from "../Interfaces/redshiftData";

dotenv.config();

export const createLidOffer = (lidInfo: any): void => {
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

    let stats: IRedshiftData = redshiftOffer(lidInfo)

    // @ts-ignore
    process.send({
      type: 'clickOffer',
      value: 1,
      stats: stats
    });

    for (const key in lidInfo) {
      if (!lidInfo[key]) {
        if (key === 'isCpmOptionEnabled'
          || key === 'originIsCpmOptionEnabled'
        ) {
          continue
        }
        delete lidInfo[key]
      }
    }

    let leadParams = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Item: lidInfo
    }
    ddbClient.send(new PutCommand(leadParams)).then().catch(e => {
      influxdb(500, 'dynamo_db_create_lid_error')
      consola.error('DynamoDb create Lid Error:', e)
    })
    // consola.info("AWS_DYNAMODB_TABLE_NAME config:", process.env.AWS_DYNAMODB_TABLE_NAME);
    // consola.info("AWS_DYNAMODB_REGION config:", process.env.AWS_DYNAMODB_REGION);
    // consola.info("Dynamo Db Success res:", JSON.stringify(data));
  } catch (e) {
    influxdb(500, 'create_lid_offer_error')
    consola.error('createLidOfferError:', e)
  }
}

const redshiftOffer = (lidObj: IParams) => (
  {
    'lid': lidObj.lid,
    'affiliate_id': +lidObj.affiliateId || 0,
    'campaign_id': +lidObj.campaignId || 0,
    'offer_id': +lidObj.offerId || 0,
    'landing_page': lidObj.landingPageUrl || '',
    'landing_page_id': +lidObj.landingPageId || 0,
    'payin': lidObj.payin || 0,
    'payout': lidObj.payout || 0,
    'geo': lidObj.country || '',
    'cap_override_offer_id': lidObj.capOverrideOfferId || 0,
    'is_cpm_option_enabled': lidObj.isCpmOptionEnabled || 0,
    'landing_page_id_origin': lidObj.landingPageIdOrigin || 0,
    'landing_page_url_origin': lidObj.landingPageUrlOrigin || '',
    'advertiser_id': +lidObj.advertiserId || 0,
    'advertiser_manager_id': +lidObj.advertiserManagerId || 0,
    'affiliate_manager_id': +lidObj.affiliateManagerId || 0,
    'origin_advertiser_id': +lidObj.originAdvertiserId! || 0,
    'origin_conversion_type': lidObj.originConversionType || '',
    'origin_is_cpm_option_enabled': lidObj.originIsCpmOptionEnabled || 0,
    'origin_offer_id': +lidObj.originOfferId! || 0,
    'origin_vertical_id': +lidObj.originVerticalId! || 0,
    'verticals': lidObj.verticalId || 0,
    'conversion_type': lidObj.conversionType || '',
    'platform': lidObj.platform || '',
    'payout_percent': lidObj.payoutPercent || 0,
    'device': lidObj.deviceType || '',
    'os': lidObj.os || '',
    'isp': lidObj.isp || '',
    'referer': lidObj.referer || '',
    'date_added': new Date().getTime(),
    'click': 1,
    'event_type': lidObj.eventType || ''
  }
)

