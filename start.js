const axios = require('axios');
const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getSales = require('./lib/functions/lightspeed/getSales.js');
const parseSales = require('./lib/functions/lightspeed/parseSales.js');
const getSKUs = require('./lib/functions/lightspeed/getSKUs.js');
const getOrderIDs = require('./lib/functions/amazon/getOrderIDs.js');
const getOrderItems = require('./lib/functions/amazon/getOrderItems.js');
const buildInventoryFeed = require('./lib/functions/amazon/buildInventoryFeed.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

(async () => {
  /* 
  // get a list of order IDs - the time range is measured in minutes ** getOrderIDs(minutes) **
  // the end of the time range is not now but 60 minutes in the past, due to an issue with the MWS API
  const orders = await getOrderIDs(1000);
  if (orders === undefined) {
    return;
  }

  // get a list of SKUs and their quantities ordered using the order IDs
  const orderItems = await getOrderItems(orders);
  console.log('complete', orderItems);

  return; */
  // refresh the token
  const accessToken = await refreshToken();
  if (typeof accessToken == 'string') {
    // creating the authentication header for all future API calls
    const authHeader = {
      Authorization: `Bearer ${accessToken}`
    };

    // getting the account ID
    const accountID = await getAccountID(authHeader);

    // getting the past 60 minutes of Lightspeed sales
    const salesRaw = await getSales(authHeader, accountID, 2000);
    if (salesRaw['@attributes'] && salesRaw['@attributes'].count == '0') {
      return;
    }

    // parsing the sales into an array of small objects that only contain necessary info
    let sales = await parseSales(salesRaw);

    // querying the API to get the SKU for each sale item
    sales = await getSKUs(authHeader, accountID, sales);

    // pruning items that don't have SKUs
    sales = sales.filter(sale => sale.SKU.length > 0);
    console.log(sales);

    // builds an XML file for submitting to Amazon as an inventory update
    // the second function parameter is for your "fulfillment latency" on Amazon; the time it
    // takes you to ship an item.. unfortunately this is a required field on Amazon's end.
    const xml = await buildInventoryFeed(sales, 4);
    console.log(xml);
  }
})();
