const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getSales = require('./lib/functions/lightspeed/getSales.js');
const parseSales = require('./lib/functions/lightspeed/parseSales.js');
const getSKUs = require('./lib/functions/lightspeed/getSKUs.js');
const buildInventoryFeed = require('./lib/functions/amazon/buildInventoryFeed.js');
const submitInventoryFeed = require('./lib/functions/amazon/submitInventoryFeed.js');

const syncLightspeedToAmazon = async () => {
  return new Promise(async (resolve, reject) => {
    // refresh the token
    accessToken = await refreshToken();
    if (typeof accessToken == 'string') {
      // creating the authentication header for all future API calls
      const authHeader = {
        Authorization: `Bearer ${accessToken}`
      };

      // getting the account ID
      const accountID = await getAccountID(authHeader);

      // getting the past 60 minutes of Lightspeed sales
      const salesRaw = await getSales(authHeader, accountID, 60);
      if (salesRaw['@attributes'] && salesRaw['@attributes'].count == '0') {
        return;
      }

      // parsing the sales into an array of small objects that only contain necessary info
      let sales = await parseSales(salesRaw);

      // querying the API to get the SKU and sellable quantity for each sale item
      let inventory = await getSKUs(authHeader, accountID, sales);

      // pruning items that don't have SKUs
      inventory = inventory.filter(item => item.SKU.length > 0);

      // builds an XML file for submitting to Amazon as an inventory update
      // the second function parameter is for your "fulfillment latency" on Amazon; the time it
      // takes you to ship an item.. unfortunately this is a required field on Amazon's end.
      const inventoryFeed = await buildInventoryFeed(inventory, 4);

      // submits the inventory feed to Amazon
      await submitInventoryFeed(inventoryFeed);
      resolve();
    } else {
      reject();
    }
  });
};

module.exports = syncLightspeedToAmazon;
