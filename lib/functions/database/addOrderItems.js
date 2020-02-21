const SQLite = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const logger = require('../../logger.js');
const db = new SQLite.Database(dbPath);

const addOrderItems = (orderItems, orderID) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE amazonOrders SET items = $items WHERE id = $id',
      {
        $items: JSON.stringify(orderItems),
        $id: orderID
      },
      err => {
        if (err) {
          logger.log({
            level: 'error',
            message: `UNABLE TO ADD ORDER ITEMS FROM ORDER ${orderID} TO LOCAL DATABASE`
          });
        }
        logger.log({
          level: 'info',
          message: `Added items from order ${orderID} to its entry in the local database`
        });
        resolve();
      }
    );
  });
};

module.exports = addOrderItems;
