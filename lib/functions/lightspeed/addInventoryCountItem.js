const axios = require('axios');
const logger = require('../../logger.js');
const pushNotification = require('../../pushNotification.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const addInventoryCountItem = (
  authHeader,
  accountID,
  item,
  inventoryCountID
) => {
  return new Promise((resolve, reject) => {
    const itemParams = {
      qty: item.currentQty - item.qty,
      inventoryCountID: inventoryCountID,
      itemID: parseInt(item.itemID),
      employeeID: 5
    };

    /* if (itemParams.qty <= 0 && process.env.ONESIGNAL_KEY !== undefined) {
      pushNotification(item.itemTitle);
    } */

    axios({
      url: `${lightspeedApi}/Account/${accountID}/InventoryCountItem.json`,
      method: 'post',
      headers: authHeader,
      data: itemParams
    })
      .then(response => {
        logger.log({
          level: 'info',
          message: `Added Item ID ${itemParams.itemID} to inventory count with a quantity of ${itemParams.qty}`
        });
        resolve(response.data);
      })
      .catch(err => {
        logger.log({
          level: 'error',
          message: `UNABLE TO ADD ITEM ID ${itemParams.itemID} TO INVENTORY COUNT`
        });
        console.error(err);
        reject(err);
      });
  });
};

module.exports = addInventoryCountItem;
