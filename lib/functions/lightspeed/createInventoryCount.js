const axios = require('axios');
const addInventoryCountItem = require('./addInventoryCountItem.js');
const logger = require('../../logger.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const createInventoryCount = (authHeader, accountID, orderItems) => {
  return new Promise(async (resolve, reject) => {
    let dateTime = new Date();
    dateTime = dateTime.toLocaleString('en-US', {
      timeZone: 'America/New_York'
    });

    const inventoryCountParams = {
      name: `Amazon sync: ${dateTime}`,
      shopID: 1
    };

    axios({
      url: `${lightspeedApi}/Account/${accountID}/InventoryCount.json`,
      method: 'post',
      headers: authHeader,
      data: inventoryCountParams
    })
      .then(response => {
        const inventoryCountID = response.data.InventoryCount.inventoryCountID;

        logger.log({
          level: 'info',
          message: `Inventory Count created with ID ${inventoryCountID}`
        });

        orderItems.forEach(async (item, index) => {
          setTimeout(async () => {
            await addInventoryCountItem(
              authHeader,
              accountID,
              item,
              inventoryCountID
            );
            if (index + 1 === orderItems.length) {
              logger.log({
                level: 'info',
                message: 'Finished adding items to inventory count'
              });
              resolve(inventoryCountID);
            }
          }, 3000 * (index + 2));
        });
      })
      .catch(err => {
        logger.log({
          level: 'error',
          message: 'UNABLE TO CREATE AN INVENTORY COUNT IN LIGHTSPEED'
        });
        console.error(err);
        reject(err);
      });
  });
};

module.exports = createInventoryCount;
