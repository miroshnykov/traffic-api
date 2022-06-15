import puppeteer from 'puppeteer';
// import fs from 'fs';

(async () => {
  // fs.truncate('checkOfferIdProportional.txt', 0, () => {
  //   console.log('checkOfferIdProportional clean');
  // });
  console.log('processing ...');
  let success = 0;
  let errors = 0;
  const listOfferId = [];
  for (let i = 0; i < 500; i++) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // const url = 'http://localhost:5000/pl?o=4ada45cd14d1d2371b9bab42c364c387:18e7080c07919bf912b79ff361465076&debugging=debugging';
      const url = 'https://stage.ryzvxm.com/pl?o=363a2f6f7116bf027cee6f9125c5d912:5ca826c1968ed9f58dd3e51b74b4eb47&debugging=debugging';
      await page.goto(url);
      const elements = await page.$('body > pre');
      const text = await page.evaluate((element) => element.innerText, elements);
      const obj = JSON.parse(text);
      // console.log(obj.data.lidObj.lid);

      const { offerId } = obj?.data?.lidObj;
      // console.log(`num ${i} OfferId:`, offerId);
      listOfferId.push(offerId);
      // fs.appendFile('checkOfferIdProportional.txt', `\n${offerId} ${lid}`, (err) => {
      //   if (err) throw err;
      // });
      // console.log('elements:', elements);
      await browser.close();
      success++;
    } catch (e) {
      console.error('Errors:', e);
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

  const calcOfferIdResponse = calcOfferIdProportional.sort((a: any, b: any) => a.count - b.count);
  console.log('calcOfferIdResponse:', calcOfferIdResponse);
  console.log(`success:${success}, errors:${errors} `);
})();
