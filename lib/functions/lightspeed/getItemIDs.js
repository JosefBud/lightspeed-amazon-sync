const axios = require('axios');
const logger = require('../../logger.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getItemIDs = (authHeader, accountID, orderItems) => {
  return new Promise((resolve, reject) => {
    let itemSKUs = [];
    orderItems.forEach(item => {
      itemSKUs.push(item.itemSKU);
    });

    const loadRelations = ['ItemShops'];

    itemSKUs.forEach((itemSKU, itemSKUsIndex) => {
      setTimeout(() => {
        axios({
          url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
            loadRelations
          )}&customSku=${itemSKU}`,
          method: 'get',
          headers: authHeader
        })
          .then(response => {
            const items = response.data.Item;
            if (items && items[0]) {
              items.forEach(item => {
                orderItems.forEach((orderItem, index) => {
                  if (item.customSku === orderItem.itemSKU) {
                    orderItems[index] = {
                      ...orderItems[index],
                      itemID: item.itemID,
                      currentQty: parseInt(item.ItemShops.ItemShop[0].sellable)
                    };

                    logger.log({
                      level: 'info',
                      message: `Lightspeed item "${item.description}" matched with Amazon SKU "${orderItem.itemSKU}"`
                    });
                  }
                });
              });
            } else if (items) {
              orderItems.forEach((orderItem, index) => {
                if (items.customSku === orderItem.itemSKU) {
                  orderItems[index] = {
                    ...orderItems[index],
                    itemID: items.itemID,
                    currentQty: parseInt(items.ItemShops.ItemShop[0].sellable)
                  };

                  logger.log({
                    level: 'info',
                    message: `Lightspeed item "${items.description}" matched with Amazon SKU "${orderItem.itemSKU}"`
                  });
                }
              });
            } else {
              orderItems = undefined;
              logger.log({
                level: 'info',
                message: `No match was found for Amazon SKU "${itemSKU}"`
              });
            }

            if (itemSKUsIndex + 1 === itemSKUs.length) {
              logger.log({
                level: 'info',
                message: `Lightspeed Item/Amazon Item matching finished`
              });
              resolve(orderItems);
            }
          })
          .catch(err => {
            logger.log({
              level: 'error',
              message: `LIGHTSPEED ITEM PULL FAILED FOR AMAZON SKU "${itemSKU}"`
            });
            reject(err);
          });
      }, 2000 * itemSKUsIndex);
    });
  });
};

module.exports = getItemIDs;
