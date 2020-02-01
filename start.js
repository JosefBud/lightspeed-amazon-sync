const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getSales = require('./lib/functions/lightspeed/getSales.js');
const parseSales = require('./lib/functions/lightspeed/parseSales.js');
const getSKUs = require('./lib/functions/lightspeed/getSKUs.js');
const getOrderIDs = require('./lib/functions/amazon/getOrderIDs.js');
const getOrderItems = require('./lib/functions/amazon/getOrderItems.js');
const buildInventoryFeed = require('./lib/functions/amazon/buildInventoryFeed.js');
const submitInventoryFeed = require('./lib/functions/amazon/submitInventoryFeed.js');
const getItemIDs = require('./lib/functions/lightspeed/getItemIDs.js');
const createInventoryCount = require('./lib/functions/lightspeed/createInventoryCount.js');
const reconcileInventoryCount = require('./lib/functions/lightspeed/reconcileInventoryCount.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

(async () => {
  // refresh the token
  const accessToken = await refreshToken();
  if (typeof accessToken == 'string') {
    // creating the authentication header for all future API calls
    const authHeader = {
      Authorization: `Bearer ${accessToken}`
    };

    // getting the account ID
    const accountID = await getAccountID(authHeader);

    // get a list of order IDs - the time range is measured in minutes ** getOrderIDs(minutes) **
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
    orderItems = await getItemIDs(authHeader, accountID, mockOrderItems);

    // creates an inventory count and fills it with the order items
    const inventoryCountID = await createInventoryCount(
      authHeader,
      accountID,
      orderItems
    );

    // reconciles the inventory count, finalizing the sync
    // on a 2-second timeout for rate limiting
    await reconcileInventoryCount(authHeader, accountID, inventoryCountID);
  }
  return;
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
  }
})();
