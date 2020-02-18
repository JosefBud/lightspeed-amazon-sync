const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');
const massSync = require('./massSync.js');

(async () => {
  await syncAmazonToLightspeed();
  //await syncLightspeedToAmazon();
  await massSync();
})();

// 15-minute interval
setInterval(async () => {
  await syncAmazonToLightspeed();
  //await syncLightspeedToAmazon();
  await massSync();
}, 900000);
