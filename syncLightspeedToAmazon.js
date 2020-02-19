const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getSales = require('./lib/functions/lightspeed/getSales.js');
const parseSales = require('./lib/functions/lightspeed/parseSales.js');
const getSKUs = require('./lib/functions/lightspeed/getSKUs.js');
const buildInventoryFeed = require('./lib/functions/amazon/buildInventoryFeed.js');
const submitInventoryFeed = require('./lib/functions/amazon/submitInventoryFeed.js');
const logger = require('./lib/logger.js');

const syncLightspeedToAmazon = async () => {
  return new Promise(async (resolve, reject) => {
    // refresh the token
    accessToken = await refreshToken().catch(err => console.error(err));
    if (typeof accessToken == 'string') {
      // creating the authentication header for all future API calls
      const authHeader = {
        Authorization: `Bearer ${accessToken}`
      };

      // getting the account ID
      const accountID = await getAccountID(authHeader).catch(err =>
        console.error(err)
      );

      // getting the past 15 minutes of Lightspeed sales
      const salesRaw = await getSales(authHeader, accountID, 15).catch(err =>
        console.error(err)
      );
      if (salesRaw['@attributes'] && salesRaw['@attributes'].count == '0') {
        logger.log({
          level: 'info',
          message:
            'No sales were found, so the Lightspeed to Amazon sync is ending.'
        });
        return;
        resolve(false);
      } else {
        resolve(true);
      }

      return;
      // parsing the sales into an array of small objects that only contain necessary info
      let sales = await parseSales(salesRaw).catch(err => console.error(err));

      // querying the API to get the SKU and sellable quantity for each sale item
      let inventory = await getSKUs(authHeader, accountID, sales).catch(err =>
        console.error(err)
      );

      // pruning items that don't have SKUs
      inventory = inventory.filter(item => item.SKU.length > 0);

      // builds an XML file for submitting to Amazon as an inventory update
      // the second function parameter is for your "fulfillment latency" on Amazon; the time it
      // takes you to ship an item.. unfortunately this is a required field on Amazon's end.
      const inventoryFeed = await buildInventoryFeed(inventory, 4).catch(err =>
        console.error(err)
      );

      // submits the inventory feed to Amazon
      await submitInventoryFeed(inventoryFeed).catch(err => console.error(err));
      resolve();
    } else {
      reject();
    }
  });
};

module.exports = syncLightspeedToAmazon;
