const axios = require('axios');
const addInventoryCountItem = require('./addInventoryCountItem.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const createInventoryCount = (authHeader, accountID, orderItems) => {
  return new Promise(async (resolve, reject) => {
    let dateTime = new Date();
    dateTime = dateTime.toLocaleString('en-US', {
      timeZone: 'America/New_York'
    });
    console.log(dateTime);

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

        orderItems.forEach(async (item, index) => {
          setTimeout(async () => {
            await addInventoryCountItem(
              authHeader,
              accountID,
              item,
              inventoryCountID
            );
            if (index + 1 === orderItems.length) {
              resolve(inventoryCountID);
            }
          }, 2000 * index);
        });
      })
      .catch(err => reject(err));
  });
};

module.exports = createInventoryCount;
