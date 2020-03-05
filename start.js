const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');
const massSync = require('./massSync.js');
const logger = require('./lib/logger.js');

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
    ordersToPrint.forEach(async (order, index) => {
      await invoiceCreator(order);
      if (index + 1 === ordersToPrint.length) {
        logger.log({
          level: 'info',
          message: 'Process exiting'
        });
      }
    });
  }

  setTimeout(() => {
    process.exit(1);
  }, 5 * 1000);
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
