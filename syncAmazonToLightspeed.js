const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getOrderIDs = require('./lib/functions/amazon/getOrderIDs.js');
const getOrderItems = require('./lib/functions/amazon/getOrderItems.js');
const getItemIDs = require('./lib/functions/lightspeed/getItemIDs.js');
const createInventoryCount = require('./lib/functions/lightspeed/createInventoryCount.js');
const reconcileInventoryCount = require('./lib/functions/lightspeed/reconcileInventoryCount.js');

const syncAmazonToLightspeed = async () => {
  return new Promise(async (resolve, reject) => {
    // refresh the token
    const accessToken = await refreshToken();
    if (typeof accessToken == 'string') {
      // creating the authentication header for all future API calls
      const authHeader = {
        Authorization: `Bearer ${accessToken}`
      };

      // getting the account ID
      const accountID = await getAccountID(authHeader);

      // get a list of order IDs - the time range is measured in minutes: getOrderIDs(minutes)
      // the end of the time range is not now but 60 minutes in the past, due to an issue with the MWS API
      const orders = await getOrderIDs(240);
      if (orders === undefined || orders.length === 0) {
        return;
      }

      // get a list of SKUs and their quantities ordered using the order IDs
      let orderItems = await getOrderItems(orders);
      const mockOrderItems = [
        {
          itemSKU: '22789',
          qty: 1
        },
        {
          itemSKU: '22790',
          qty: 2
        },
        {
          itemSKU: '22791',
          qty: 3
        },
        {
          itemSKU: '22792',
          qty: 1
        }
      ];

      // get Lightspeed item IDs and current sellable quantities of the order items
      orderItems = await getItemIDs(
        authHeader,
        accountID,
        orderItems
      ).catch(err => console.error(err));
      console.log(orderItems);
      return;

      // creates an inventory count and fills it with the order items
      const inventoryCountID = await createInventoryCount(
        authHeader,
        accountID,
        orderItems
      );

      // reconciles the inventory count, finalizing the sync
      // on a 2-second timeout for rate limiting
      await reconcileInventoryCount(authHeader, accountID, inventoryCountID);
      resolve();
    } else {
      reject();
    }
  });
};

module.exports = syncAmazonToLightspeed;
