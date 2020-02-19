const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');
const massSync = require('./massSync.js');

(async () => {
  const thereAreOrders = await syncAmazonToLightspeed();
  //await syncLightspeedToAmazon();

  if (thereAreOrders) {
    await massSync();
  }
})();

// 15-minute interval
setInterval(async () => {
  const thereAreOrders = await syncAmazonToLightspeed();
  //await syncLightspeedToAmazon();
  if (thereAreOrders) {
    await massSync();
  }
}, 900000);
