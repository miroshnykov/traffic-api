import { offersStartEndDateSetupCalculations } from '../Services/offers/restrictions/offersStartEndDateSetup';
import { offersGeoRestrictions } from '../Services/offers/restrictions/offersGeoRestrictions';
import { offersCustomLpRules } from '../Services/offers/restrictions/offersCustomLpRules';

const params = {
  offerId: 35896,
  campaignId: 47,
  affiliateId: 5,
  affiliateStatus: 'blacklisted',
  affiliateType: 'Marketer',
  campaignStatus: 'active',
  affiliateManagerId: 2,
  offerType: 'regular',
  deviceType: 'desktop',
  offerName: 'customLp',
  conversionType: 'cpi',
  landingPageId: 164,
  landingPageUrl: 'customLp.com',
  payIn: 4,
  payOut: 4,
  payoutPercent: 0,
  isCpmOptionEnabled: 0,
  verticalId: 1,
  verticalName: 'notdefined',
  advertiserId: 1,
  advertiserName: 'ded',
  advertiserManagerId: 1,
  offerDescription: 'offerDescriptionTest',
  isUniqueVisit: false,
  offerInfo: {
    offerId: 35896,
    name: 'customLp',
    advertiserId: 1,
    advertiserName: 'ded',
    advertiserManagerId: 1,
    verticalId: 1,
    verticalName: 'notdefined',
    currencyId: 1,
    status: 'public',
    payin: 4.00000000,
    payout: 4.00000000,
    isCpmOptionEnabled: 0,
    payoutPercent: 0,
    landingPageId: 164,
    landingPageUrl: 'customLp.com',
    sflOfferGeoId: 0,
    geoRules: '{"geo":[{"country":"AG","include":true},{"country":"AM","include":true},{"country":"US","include":true}]}',
    geoOfferId: 35896,
    conversionType: 'cpi',
    customLpRules: '{"customLPRules":[{"id":164,"pos":0,"country":"US","lpName":"customLp.com","lpUrl":"customLp.com"}]}',
    capOfferId: 35896,
    useStartEndDate: false,
    startDate: null,
    endDate: null,
    descriptions: '',
    offerIdRedirectExitTraffic: 0,
    type: 'regular',
    countriesRestrictions: 'CA,AO,BF,BI,BJ,BW,CD,CF,CG,CI,EG,ER,ET,GH,GM,GN,GW,KE,LR,LS,MG,MK,ML,MR,MZ,NA,NG,RE,RW,SD,SL,SO,SS,SZ,TD,TG,TN,TZ,UG,ZW,SN,MA,DZ,BR,CN,CY,IN,ID,IL,MY,AF,GE,IR,IQ,PK,RO,RU,BA,BB,UA,AI,KY',
    customPayOutCount: 0,
    startEndDateSetting: {
      dateRangePass: false,
    },
  },
  lid: '028a9b77-b34d-4799-a5fd-2a6b8365e641',
  campaignInfo: {
    campaignId: 47,
    name: 'customLP',
    offerId: 35896,
    affiliateId: 5,
    affiliateStatus: 'blacklisted',
    affiliateType: 'Marketer',
    campaignStatus: 'active',
    capSetup: false,
    payout: 4,
    payoutPercent: 1,
    affiliateManagerId: 2,
  },
  browser: 'Chrome',
  host: 'localhost:5000',
  originalUrl: '/ad?offer=603debdecf27b405d7d60e2b6e3bd9bf:48ffc642c5f377a2616e053e76bab93a586d215818fc088646ecee9f9086fc207441b5cdb784e04786b9227214b05ef8&debugging=debugging',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
  browserEngine: 'Blink',
  browserVersion: '94.0',
  os: 'GNU/Linux',
  platform: 'x64',
  debug: true,
  geoInfo: {
    country: 'US',
    region: 'CA',
    city: 'San Jose',
    ll: [
      37.425,
      -121.946,
    ],
    isp: 'Colba Net',
  },
  country: 'US',
  city: 'San Jose',
  isp: 'Colba Net',
  region: 'CA',
  offerHash: '603debdecf27b405d7d60e2b6e3bd9bf:48ffc642c5f377a2616e053e76bab93a586d215818fc088646ecee9f9086fc207441b5cdb784e04786b9227214b05ef8',
  startTime: 1634673464210,
  speedTime: 1634673464310,
  redirectUrl: '',
  isExitOffer: false,
};

test('OfferStartEndDataRangeNotPass', async () => {
  const res = await offersStartEndDateSetupCalculations(params);
  expect(res.success).toBeTruthy();
});

test('OfferStartEndDataRangePass', async () => {
  params.offerInfo.startEndDateSetting.dateRangePass = true;
  const res = await offersStartEndDateSetupCalculations(params);
  expect(res.success).not.toBeTruthy();
});

test('offersGeoRestrictionsPass', async () => {
  params.offerInfo.countriesRestrictions = 'US';
  const res = await offersGeoRestrictions(params);
  expect(res.success).toBeTruthy();
});

test('offersGeoRestrictionsFailed', async () => {
  params.offerInfo.countriesRestrictions = 'CA';
  const res = await offersGeoRestrictions(params);
  expect(res.success).not.toBeTruthy();
});

test('offersCustomLpRulesPass', async () => {
  params.offerInfo.customLpRules = '{"customLPRules":[{"id":574,"pos":0,"country":"US","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}';
  const res = await offersCustomLpRules(params);
  expect(res.success).toBeTruthy();
});

test('offersCustomLpRulesNotPass', async () => {
  params.offerInfo.customLpRules = '{"customLPRules":[{"id":574,"pos":0,"country":"CA","lpName":"testDimon.com","lpUrl":"testDimon.com"}]}';
  const res = await offersCustomLpRules(params);
  expect(res.success).not.toBeTruthy();
});
