import puppeteer from 'puppeteer';
import consola from 'consola';
// import fs from 'fs';

(async () => {
  // fs.truncate('checkOfferIdProportional1.txt', 0, () => {
  //   console.log('checkOfferIdProportional clean');
  // });
  const COUNT_CLICKS = 10;
  consola.info(`processing ${COUNT_CLICKS} clicks ...`);
  let success = 0;
  let errors = 0;
  const listOfferId = [];
  for (let i = 0; i < COUNT_CLICKS; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const browser = await puppeteer.launch();
      // eslint-disable-next-line no-await-in-loop
      const page = await browser.newPage();
      // const url = 'http://localhost:5000/pl?o=4ada45cd14d1d2371b9bab42c364c387:18e7080c07919bf912b79ff361465076&debugging=debugging';
      // aggreagted offer 30
      // const url = 'https://stage.ryzvxm.com/pl?o=363a2f6f7116bf027cee6f9125c5d912:5ca826c1968ed9f58dd3e51b74b4eb47&debugging=debugging';
      // aggreagted offer 1 stalo 7
      // const url = 'https://stage.xuzeez.com/pl?o=44424490c4dd8f88f6baaef4f7e637d3:d8491be6261a9bcb4f80b34967659dfa&debugging=debugging';
      // PROD
      // const url = 'https://uvbyty.com/pl?o=836562d709fc932a2048034e567103f0:1fd3e7bf5c70b4136dbd71ec1821a59d&debugging=debugging';
      // const url = 'https://ryzvxm.com/pl?o=a44434adfb1f7af9676edcacd496e99b:bf611ed6acd895b5dacde24295523aac&debugging=debugging';
      const urls = [
        'http://localhost:5000/pl?o=4ada45cd14d1d2371b9bab42c364c387:18e7080c07919bf912b79ff361465076&debugging=debugging',
        'http://localhost:5000/pl?o=a8dab9dbf3db963c2be6d7fa1a78c555:2f1c7f022ab455a084bdc527fc106617&debugging=debugging',
      ];
      const randomId = Math.floor(Math.random() * urls.length);
      // eslint-disable-next-line no-await-in-loop
      await page.goto(urls[randomId]);
      // eslint-disable-next-line no-await-in-loop
      // await page.goto(url);
      // eslint-disable-next-line no-await-in-loop
      const elements = await page.$('body > pre');
      // eslint-disable-next-line no-await-in-loop
      const text = await page.evaluate((element) => element.innerText, elements);
      const obj = JSON.parse(text);
      // console.log(obj.data.lidObj.lid);

      const { offerId } = obj?.data?.lidObj;
      // console.log(`num ${i} OfferId:`, offerId);
      listOfferId.push(offerId);
      // fs.appendFile('checkOfferIdProportional1.txt', `\n${offerId} ${lid}`, (err) => {
      //   if (err) throw err;
      // });
      // console.log('elements:', elements);
      // eslint-disable-next-line no-await-in-loop
      await browser.close();
      success++;
    } catch (e) {
      consola.error('Errors:', e);
      errors++;
    }
  }
  // console.log('listOfferId:', listOfferId);
  // const count: any = {};
  //
  // listOfferId.forEach((element) => {
  //   count[element] = (count[element] || 0) + 1;
  // });
  // console.log('count:', count);
  const calcOfferIdProportional: any = [];
  for (const id of listOfferId) {
    const checkId = calcOfferIdProportional.filter((i: any) => (i.id === id));
    if (checkId.length === 0) {
      calcOfferIdProportional.push({
        id, count: 1,
      });
    } else {
      calcOfferIdProportional.forEach((item: { id: number, count: number }) => {
        if (item.id === id) {
          // eslint-disable-next-line no-param-reassign
          item.count += 1;
        }
      });
    }
  }

  const calcOfferIdResponse = calcOfferIdProportional
    .sort((a: any, b: any) => a.count - b.count);
  consola.info(`calcOfferIdResponse: ${JSON.stringify(calcOfferIdResponse)}`);
  consola.info(`success:${success}, errors:${errors} `);
})();
