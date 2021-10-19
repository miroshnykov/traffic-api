import {offersStartEndDateSetupCalculations} from '../Services/offers/restrictions/offersStartEndDateSetup'
import consola from "consola";
import {offersGeoRestrictions} from '../Services/offers/restrictions/offersGeoRestrictions'
import {offersCustomLpRules} from '../Services/offers/restrictions/offersCustomLpRules'

let params ={
  "offerId": 35893,
  "campaignId": 44,
  "affiliateId": 5,
  "affiliateManagerId": 2,
  "offerType": "regular",
  "deviceType": "desktop",
  "offerName": "reqularOffer",
  "conversionType": "cpi",
  "landingPageId": 141,
  "landingPageUrl": "regularOffer.com",
  "payin": 2,
  "payout": 3,
  "isCpmOptionEnabled": 0,
  "verticalId": 1,
  "verticalName": "notdefined",
  "advertiserId": 1,
  "advertiserName": "ded",
  "advertiserManagerId": 1,
  "offerInfo": {
    "offerId": 35893,
    "name": "reqularOffer",
    "advertiserId": 1,
    "advertiserName": "ded",
    "verticalId": 1,
    "verticalName": "notdefined",
    "advertiserManagerId": 1,
    "conversionType": "cpi",
    "currencyid": 1,
    "status": "public",
    "payin": 2.00000000,
    "payout": 3.00000000,
    "payoutPercent": 0,
    "isCpmOptionEnabled": 0,
    "landingPageId": 141,
    "landingPageUrl": "regularOffer.com",
    "sflOfferGeoId": 0,
    "geoRules": "{\"geo\":[]}",
    "geoOfferId": 35893,
    "customLpRules": "{\"customLPRules\":[]}",
    "offerIdRedirectExitTraffic": 0,
    "useStartEndDate": false,
    "startDate": null,
    "endDate": null,
    "type": "regular",
    "customPayOutCount": 0,
    "capOfferId": 35893,
    "startEndDateSetting":{
      "dateRangePass":false
    }
  },
  "lid": "c13fbbb3-96c9-49ea-93d4-8d90d669d1a8",
  "campaignInfo": {
    "campaignId": 44,
    "name": "reqularOffer",
    "offerId": 35893,
    "affiliateId": 5,
    "payout": 3,
    "payoutPercent": 1,
    "affiliateManagerId": 2
  },
  "browser": "Chrome",
  "host": "localhost:5000",
  "originalUrl": "/ad?offer=25eab70cee1a4abae25658e7d32e72c6:509e38e2d406a4004022bfa63f1554a54a8422ae4936f4574934421b1b6ee847b538c61908eab8f53abcccbb16bd00cb&debugging=debugging",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
  "browserEngine": "Blink",
  "browserVersion": "94.0",
  "os": "GNU/Linux",
  "debug": true,
  "geoInfo": {
    "country": "US",
    "region": "CA",
    "city": "San Jose",
    "ll": [37.425, -121.946],
    "isp": "Colba Net"
  },
  "country": "US",
  "city": "San Jose",
  "isp": "Colba Net",
  "region": "CA",
  "offerHash": "25eab70cee1a4abae25658e7d32e72c6:509e38e2d406a4004022bfa63f1554a54a8422ae4936f4574934421b1b6ee847b538c61908eab8f53abcccbb16bd00cb",
  "startTime": 1634590149520,
  "customPayOutPerGeo": [],
  "redirectReason": "",
  "redirectType": "",
  "redirectUrl": "",
  "payoutPercent": 1,
  "platform": "3e3",
}

test('OfferStartEndDataRangeNotPass', async () => {
  const res = await offersStartEndDateSetupCalculations(params)
  expect(res).toBeTruthy()
})

test('OfferStartEndDataRangePass', async () => {
  params.offerInfo.startEndDateSetting.dateRangePass = true
  const res = await offersStartEndDateSetupCalculations(params)
  expect(res).not.toBeTruthy()
})

test('offersGeoRestrictionsPass', async () => {
  params.offerInfo.geoRules = '{"geo":[{"country":"US","include":true}]}'
  const res = await offersGeoRestrictions(params)
  expect(res).toBeTruthy()
})

test('offersGeoRestrictionsFailed', async () => {
  params.offerInfo.geoRules = '{"geo":[{"country":"CA","include":true}]}'
  const res = await offersGeoRestrictions(params)
  expect(res).not.toBeTruthy()
})

test('offersCustomLpRulesPass', async () => {
  params.offerInfo.customLpRules = `{"customLPRules":[{"id":574,"pos":0,"country":"US","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}`
  const res = await offersCustomLpRules(params)
  expect(res).toBeTruthy()
})

test('offersCustomLpRulesNotPass', async () => {
  params.offerInfo.customLpRules = `{"customLPRules":[{"id":574,"pos":0,"country":"CA","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}`
  const res = await offersCustomLpRules(params)
  expect(res).not.toBeTruthy()
})
