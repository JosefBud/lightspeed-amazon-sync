const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');
const massSync = require('./massSync.js');

const orderGrabber = require('./lib/functions/printer/orderGrabber.js');
const orderItemGrabber = require('./lib/functions/printer/orderItemGrabber.js');
const invoiceCreator = require('./lib/functions/printer/invoiceCreator.js');

(async () => {
  const thereAreOrders = await syncAmazonToLightspeed();
  const thereAreSales = await syncLightspeedToAmazon();

  if (thereAreOrders || thereAreSales) {
    await massSync();
  }

  let ordersToPrint = await orderGrabber();
  if (ordersToPrint.length > 0) {
    ordersToPrint = await orderItemGrabber(ordersToPrint);
    ordersToPrint.forEach(async order => {
      await invoiceCreator(order);
    });
  }

  setTimeout(() => {
    process.exit(1);
  }, 2500);
})();

// 15-minute interval
/* setInterval(async () => {
  const thereAreOrders = await syncAmazonToLightspeed();
  const thereAreSales = await syncLightspeedToAmazon();
  if (thereAreOrders || thereAreSales) {
    await massSync();
  }
}, 15 * 60 * 1000);
 */
