const axios = require('axios');
const { encode } = require('url-encode-decode');
const SQLite = require('sqlite3');
const path = require('path');
const logger = require('../../logger.js');
const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const db = new SQLite.Database(dbPath);
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const pullOrderItems = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM amazonOrders WHERE reconciled = 0', (err, rows) => {
      if (err) {
        logger.log({
          level: 'error',
          message: 'UNABLE TO PULL UNRECONCILED ORDERS FROM LOCAL DATABASE'
        });
        reject(err);
        return;
      }

      let orderItems = [];
      if (rows) {
        rows.forEach(order => {
          const items = JSON.parse(order.items);
          items.forEach(item => {
            orderItems.push(item);
          });
        });
      }

      resolve(orderItems);
    });
  });
};

const getItemIDs = (authHeader, accountID, orderItems) => {
  return new Promise(async (resolve, reject) => {
    let itemSKUs = [];

    // reverseCanceledOrders uses this function with the orderItems argument
    // the sync needs to pull the most recent orders from the local DB without this argument
    if (!orderItems) {
      orderItems = await pullOrderItems();
    }

    orderItems.length === 0 && resolve(orderItems);

    orderItems.forEach(item => {
      itemSKUs.push(item.itemSKU);
    });

    const loadRelations = ['ItemShops'];

    itemSKUs.forEach((itemSKU, itemSKUsIndex) => {
      setTimeout(() => {
        axios({
          url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
            loadRelations
          )}&customSku=${encode(itemSKU)}`,
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
                      message: `Lightspeed item ${item.description} matched with Amazon SKU ${orderItem.itemSKU}`
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
                    message: `Lightspeed item ${items.description} matched with Amazon SKU ${orderItem.itemSKU}`
                  });
                }
              });
            } else {
              orderItems.forEach((orderItem, index) => {
                if (itemSKU === orderItem.itemSKU) {
                  orderItems.splice(index, 1);
                }
              });
              logger.log({
                level: 'warn',
                message: `No match was found for Amazon SKU ${itemSKU}`
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
              message: `LIGHTSPEED ITEM PULL FAILED FOR AMAZON SKU ${itemSKU}`
            });
            reject(err);
          });
      }, 2000 * itemSKUsIndex);
    });
  });
};

module.exports = getItemIDs;
