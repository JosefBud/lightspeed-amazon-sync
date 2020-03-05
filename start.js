const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');
const massSync = require('./massSync.js');

(async () => {
  const thereAreOrders = await syncAmazonToLightspeed();
  const thereAreSales = await syncLightspeedToAmazon();

  if (thereAreOrders || thereAreSales) {
    await massSync();
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
