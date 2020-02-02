const axios = require('axios');
const fs = require('fs');
const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getFullInventory = require('./lib/functions/lightspeed/getFullInventory.js');
const buildInventoryFeed = require('./lib/functions/amazon/buildInventoryFeed.js');
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

    // getting the full inventory of all items with Custom SKUs
    let inventory = await getFullInventory(authHeader, accountID);

    // pruning the full inventory to only their SKUs and quantities
    inventory = inventory.map(item => {
      return {
        SKU: item.customSku,
        qty: parseInt(item.ItemShops.ItemShop[0].sellable)
      };
    });

    // builds an XML file for submitting to Amazon as an inventory update
    // the second function parameter is for your "fulfillment latency" on Amazon; the time it
    // takes you to ship an item.. unfortunately this is a required field on Amazon's end.
    const inventoryFeed = await buildInventoryFeed(inventory, 4);

    return;

    // submits the inventory feed to Amazon
    await submitInventoryFeed(inventoryFeed);
  }
})();
