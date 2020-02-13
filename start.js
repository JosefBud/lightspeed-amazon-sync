const syncAmazonToLightspeed = require('./syncAmazonToLightspeed.js');
const syncLightspeedToAmazon = require('./syncLightspeedToAmazon.js');

(async () => {
  await syncAmazonToLightspeed();
  await syncLightspeedToAmazon();
})();

// 15-minute interval
setInterval(async () => {
  await syncAmazonToLightspeed();
  await syncLightspeedToAmazon();
}, 900000);
