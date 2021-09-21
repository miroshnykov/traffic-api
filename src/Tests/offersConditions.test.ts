import {offersStartEndDateSetupCalculations} from '../Services/offers/restrictions/offersStartEndDateSetup'
import consola from "consola";
import {offersGeoRestrictions} from '../Services/offers/restrictions/offersGeoRestrictions'
import {offersCustomLpRules} from '../Services/offers/restrictions/offersCustomLpRules'

let offerInfo = {
  offerId: 5,
  name: 'Offer 5',
  advertiserId: 1,
  advertiserName: 'Gotzha',
  verticalId: 1,
  verticalName: 'verticals not defined',
  advertiserManagerId: 1,
  conversionType: 'cpi',
  currencyid: 1,
  status: 'inactive',
  payin: 50,
  payout: 40,
  payoutPercent: 0,
  isCpmOptionEnabled: 1,
  landingPageId: 569,
  landingPageUrl: 'testDimon.com',
  sflOfferGeoId: 0,
  geoRules: '{"geo":[]}',
  geoOfferId: 5,
  customLpRules: '{"customLPRules":[]}',
  offerIdRedirectExitTraffic: 7,
  useStartEndDate: 0,
  startDate: '2021-08-13T04:00:00.000Z',
  endDate: '2021-08-13T04:00:00.000Z',
  type: 'regular',
  startEndDateSetting: {
    dateRangePass: false
  }
}
let params = {
  deviceType: 'Desktop',
  browser: 'Chrome',
  host: 'localhost:8088',
  originalUrl: '/ad?offer=9d8bbc634c68d6f005f97c85f3c65e59:a0c2fd0c77908af2abc0b23076290fceaeae16f31c03c3116cea0e4b8c2aeefa9edda96f7adc3e2a384446d25c7c8637&debugging=debugging',
  adDomain: undefined,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  referer: undefined,
  searchEngine: undefined,
  browserEngine: 'Webkit',
  browserVersion: '91.0.4472.114',
  os: 'Linux',
  country: 'CA',
  geo: 'CA',
  isp: 'Colba Net"',
  region: 'QC',
  prod: '',
  ref: '',
  debugging: 'debugging',
  offerHash: '9d8bbc634c68d6f005f97c85f3c65e59:a0c2fd0c77908af2abc0b23076290fceaeae16f31c03c3116cea0e4b8c2aeefa9edda96f7adc3e2a384446d25c7c8637',
  platform: 'Linux',
  offerId: '5',
  affiliateId: 142480,
  affiliateManagerId: 12618,
  campaignId: '19',
  landingPageId: 569,
  landingPageUrl: 'testDimon.com',
  conversionType: 'cpi',
  payoutPercent: 0,
  isCpmOptionEnabled: 1,
  advertiserId: 1,
  advertiserName: 'Gotzha',
  advertiserManagerId: 1,
  verticalId: 1,
  lid: 'da193c8f-5523-4f13-9d5c-d3055f8ac324',
  info: {},
  debug: true,
  offerInfo
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
  params.offerInfo.geoRules = '{"geo":[{"country":"CA","include":true}]}'
  const res = await offersGeoRestrictions(params)
  expect(res).toBeTruthy()
})

test('offersGeoRestrictionsFailed', async () => {
  params.offerInfo.geoRules = '{"geo":[{"country":"US","include":true}]}'
  const res = await offersGeoRestrictions(params)
  expect(res).not.toBeTruthy()
})

test('offersCustomLpRulesPass', async () => {
  params.offerInfo.customLpRules = `{"customLPRules":[{"id":574,"pos":0,"country":"CA","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}`
  const res = await offersCustomLpRules(params)
  expect(res).toBeTruthy()
})

test('offersCustomLpRulesNotPass', async () => {
  params.offerInfo.customLpRules = `{"customLPRules":[{"id":574,"pos":0,"country":"US","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}`
  const res = await offersCustomLpRules(params)
  expect(res).not.toBeTruthy()
})
