import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

import * as dotenv from 'dotenv';
import consola from 'consola';
import { influxdb } from './metrics';
import { IRedshiftData } from '../Interfaces/redshiftData';
import { ILid } from '../Interfaces/lid';

dotenv.config();

export const redshiftOffer = (lidObj: ILid): IRedshiftData => (
  {
    lid: lidObj.lid,
    affiliate_id: +lidObj.affiliateId! || 0,
    campaign_id: +lidObj.campaignId! || 0,
    sub_campaign: lidObj.subCampaign! || '',
    cid: lidObj.cid! || '',
    domain: lidObj.adDomain! || '',
    offer_id: +lidObj.offerId! || 0,
    offer_name: lidObj.offerName! || '',
    offer_type: lidObj.offerType! || '',
    offer_description: lidObj.offerDescription! || '',
    landing_page: lidObj.landingPageUrl || '',
    landing_page_id: +lidObj.landingPageId! || 0,
    payin: lidObj.payin || 0,
    payout: lidObj.payout || 0,
    geo: lidObj.country || '',
    cap_override_offer_id: lidObj.capOverrideOfferId || 0,
    is_cpm_option_enabled: lidObj.isCpmOptionEnabled || 0,
    landing_page_id_origin: lidObj.landingPageIdOrigin || 0,
    landing_page_url_origin: lidObj.landingPageUrlOrigin || '',
    advertiser_id: +lidObj.advertiserId! || 0,
    advertiser_manager_id: +lidObj.advertiserManagerId! || 0,
    affiliate_manager_id: +lidObj.affiliateManagerId! || 0,
    origin_advertiser_id: +lidObj.originAdvertiserId! || 0,
    origin_conversion_type: lidObj.originConversionType || '',
    origin_is_cpm_option_enabled: lidObj.originIsCpmOptionEnabled || 0,
    origin_offer_id: +lidObj.originOfferId! || 0,
    origin_vertical_id: +lidObj.originVerticalId! || 0,
    verticals: lidObj.verticalId || 0,
    vertical_name: lidObj.verticalName || '',
    conversion_type: lidObj.conversionType || '',
    platform: lidObj.platform || '',
    payout_percent: lidObj.payoutPercent || 0,
    device: lidObj.deviceType! || '',
    os: lidObj.os || '',
    isp: lidObj.isp || '',
    referer: lidObj.referer || '',
    date_added: new Date().getTime(),
    click: 1,
    event_type: lidObj.eventType || '',
    event: lidObj.event || '',
    fingerprint: lidObj.fingerPrintKey || '',
    is_unique_visit: lidObj.isUniqueVisit || false,
  }
);

export const sendLidDynamoDb = (lidInfoToSend: object) => {
  try {
    const dynamoDbConf = {
      region: process.env.AWS_DYNAMODB_REGION,
    };
    const ddbClient: DynamoDBClient = new DynamoDBClient(dynamoDbConf);
    const leadParams = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Item: lidInfoToSend,
    };
    ddbClient.send(new PutCommand(leadParams)).then().catch((e) => {
      influxdb(500, 'dynamo_db_create_lid_error');
      consola.error('DynamoDb create Lid Error:', e);
      if (process.send) {
        process.send({
          type: 'failedLidDynamoDb',
          stats: lidInfoToSend,
        });
      }
    });
  } catch (e) {
    consola.error('sendLidDynamoDb:', e);
    influxdb(500, 'dynamo_db_create_lid_error');
  }
};

export const createLidOffer = (lidInfo: ILid): void => {
  try {
    // const dynamoDbConf = {
    //   region: process.env.AWS_DYNAMODB_REGION,
    //   endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   tableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // }

    const stats: IRedshiftData = redshiftOffer(lidInfo);

    if (process.send) {
      process.send({
        type: 'clickOffer',
        value: 1,
        stats,
      });
    }

    let lidInfoToSend: { [index: string]: any } = {};
    lidInfoToSend = lidInfo;
    const yearPlusOne: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    lidInfoToSend.ttl = yearPlusOne.getTime();
    const excludeFields: string[] = [
      'isCpmOptionEnabled', 'originIsCpmOptionEnabled', 'isUniqueVisit',
    ];
    for (const key in lidInfoToSend) {
      if (!lidInfoToSend[key]) {
        if (!excludeFields.includes(key)) {
          delete lidInfoToSend[key];
        }
      }
    }
    sendLidDynamoDb(lidInfoToSend);
    // consola.info("AWS_DYNAMODB_TABLE_NAME config:", process.env.AWS_DYNAMODB_TABLE_NAME);
    // consola.info("AWS_DYNAMODB_REGION config:", process.env.AWS_DYNAMODB_REGION);
    // consola.info("Dynamo Db Success res:", JSON.stringify(data));
  } catch (e) {
    influxdb(500, 'create_lid_offer_error');
    consola.error('createLidOfferError:', e);
  }
};

// eslint-disable-next-line consistent-return
export const getLeadData = async (leadId: string) => {
  try {
    const dynamoDbConf = {
      region: process.env.AWS_DYNAMODB_REGION,
    };
    const leadParams = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Key: {
        lid: {
          S: leadId,
        },
      },
    };
    const ddbClient: DynamoDBClient = new DynamoDBClient(dynamoDbConf);
    const data = await ddbClient.send(new GetItemCommand(leadParams));
    return unmarshall(data?.Item!);
  } catch (e) {
    consola.error(`no lid:${leadId} in DynamoDB`, e);
  }
};
