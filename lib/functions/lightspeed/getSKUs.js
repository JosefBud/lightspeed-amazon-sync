const axios = require('axios');
const logger = require('../../logger.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getSKUs = (authHeader, accountID, sales) => {
  return new Promise((resolve, reject) => {
    let itemIDs = [];
    let currentInventory = [];
    const loadRelations = ['ItemShops'];

    sales.forEach(sale => {
      itemIDs.push(sale.itemID);
    });

    axios({
      url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
        loadRelations
      )}&itemID=IN,${itemIDs}`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        const items = response.data.Item;
        if (items[0]) {
          items.forEach(item => {
            const itemInfo = {
              itemID: item.itemID,
              SKU: item.customSku,
              qty: parseInt(item.ItemShops.ItemShop[1].sellable)
            };
            currentInventory.push(itemInfo);
          });
        } else {
          const itemInfo = {
            itemID: items.itemID,
            SKU: items.customSku,
            qty: parseInt(items.ItemShops.ItemShop[1].sellable)
          };
          currentInventory.push(itemInfo);
        }

        logger.log({
          level: 'info',
          message: 'Latest inventory for each item has been pulled'
        });
        resolve(currentInventory);
      })
      .catch(err => {
        logger.log({
          level: 'error',
          message: 'UNABLE TO PULL THE ITEMS FROM LIGHTSPEED API'
        });
        console.error(err);
        reject(err);
      });
  });
};

module.exports = getSKUs;
