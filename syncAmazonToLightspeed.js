const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getOrderIDs = require('./lib/functions/amazon/getOrderIDs.js');
const getOrderItems = require('./lib/functions/amazon/getOrderItems.js');
const getItemIDs = require('./lib/functions/lightspeed/getItemIDs.js');
const createInventoryCount = require('./lib/functions/lightspeed/createInventoryCount.js');
const reconcileInventoryCount = require('./lib/functions/lightspeed/reconcileInventoryCount.js');
const logger = require('./lib/logger.js');

const syncAmazonToLightspeed = async () => {
  return new Promise(async (resolve, reject) => {
    // refresh the token
    const accessToken = await refreshToken().catch(err => console.error(err));

    if (typeof accessToken == 'string') {
      // creating the authentication header for all future API calls
      const authHeader = {
        Authorization: `Bearer ${accessToken}`
      };

      // getting the account ID
      const accountID = await getAccountID(authHeader).catch(err =>
        console.error(err)
      );

      // get a list of order IDs - the time range is measured in minutes: getOrderIDs(minutes)
      // the end of the time range is not now but 5 minutes in the past, due to an issue with the MWS API
      const orders = await getOrderIDs(authHeader, accountID, 30).catch(err =>
        console.error(err)
      );
      if (orders === undefined || orders.length === 0) {
        resolve(false);
        return;
      }

      // get a list of SKUs and their quantities ordered using the order IDs
      let orderItems = await getOrderItems(orders).catch(err =>
        console.error(err)
      );

      // get Lightspeed item IDs and current sellable quantities of the order items
      orderItems = await getItemIDs(authHeader, accountID).catch(err =>
        console.error(err)
      );

      if (orderItems[0]) {
        // creates an inventory count and fills it with the order items
        const inventoryCountID = await createInventoryCount(
          authHeader,
          accountID,
          orderItems
        ).catch(err => console.error(err));

        // reconciles the inventory count, finalizing the sync
        // on a 2-second timeout for rate limiting
        await reconcileInventoryCount(
          authHeader,
          accountID,
          inventoryCountID
        ).catch(err => console.error(err));
        resolve(true);
      } else {
        logger.log({
          level: 'warn',
          message: 'There were no matches, so no inventory count was created'
        });
        resolve(false);
      }
    } else {
      reject();
    }
  });
};

module.exports = syncAmazonToLightspeed;
