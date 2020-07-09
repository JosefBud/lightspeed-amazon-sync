const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('./lib/functions/lightspeed/getAccountID.js');
const getCompleteInventory = require('./lib/functions/lightspeed/getCompleteInventory.js');
const cleanFullInventory = require('./lib/functions/lightspeed/cleanFullInventory.js');
const getItemList = require('./lib/functions/magento/getItemList.js');
const pruneItems = require('./lib/functions/magento/pruneItems.js');
const updateItems = require('./lib/functions/magento/updateItems.js');
async function test() {
  // refresh the token
  const accessToken = await refreshToken().catch((err) => console.error(err));

  if (typeof accessToken == 'string') {
    // creating the authentication header for all future API calls
    const authHeader = {
      Authorization: `Bearer ${accessToken}`,
    };

    // getting the account ID
    const accountID = await getAccountID(authHeader).catch((err) => console.error(err));

    // getting the full inventory in a JSON
    let inventory = await getCompleteInventory(authHeader, accountID);

    // prunes the full inventory into only the necessary data: item ID and sellable qty
    inventory = await cleanFullInventory(inventory);

    // gets the full list of items from Magento, and returns an array of SKUs
    let magentoItems = await getItemList();

    // compares inventory counts so only mismatched ones remain
    //magentoItems = await pruneItems(inventory, magentoItems);

    // goes through each item and updates that item in Magento
    await updateItems(inventory, magentoItems);
  }
}

test();
