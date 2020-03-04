const SQLite = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const logger = require('../../logger.js');
const getItemIDs = require('../lightspeed/getItemIDs.js');
const createInventoryCount = require('../lightspeed/createInventoryCount.js');
const reconcileInventoryCount = require('../lightspeed/reconcileInventoryCount.js');
const db = new SQLite.Database(dbPath);

const reverseCanceledOrders = (authHeader, accountID, orderID) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM amazonOrders WHERE id = ?',
      orderID,
      async (err, row) => {
        if (err) {
          logger.log({
            level: 'error',
            message: `UNABLE TO FIND NOW-CANCELLED ORDER ${orderID} IN LOCAL DATABASE`
          });
          resolve();
          return;
        }

        if (row) {
          if (row.status !== 'Canceled') {
            let items = JSON.parse(row.items);
            items = items.map(item => {
              return {
                ...item,
                qty: item.qty * -1
              };
            });

            items = await getItemIDs(authHeader, accountID, items);
            const inventoryCountID = await createInventoryCount(
              authHeader,
              accountID,
              items
            );
            await reconcileInventoryCount(
              authHeader,
              accountID,
              inventoryCountID
            );
            logger.log({
              level: 'info',
              message: `Successfully reconciled inventory count ${inventoryCountID} to reverse the inventory count of now-cancelled order ${orderID}`
            });
            resolve();
          } else {
            logger.log({
              level: 'info',
              message: `Now-cancelled order ${orderID} has already been re-reconciled`
            });
            resolve();
          }
        } else {
          logger.log({
            level: 'error',
            message: `UNABLE TO FIND NOW-CANCELLED ORDER ${orderID} IN LOCAL DATABASE`
          });
          resolve();
        }
      }
    );
  });
};

module.exports = reverseCanceledOrders;
