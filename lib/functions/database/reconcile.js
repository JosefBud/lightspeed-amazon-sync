const SQLite = require('sqlite3');
const path = require('path');
const logger = require('../../logger.js');
const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const db = new SQLite.Database(dbPath);

const reconcile = orderIDs => {
  return new Promise((resolve, reject) => {
    orderIDs.forEach((orderID, index) => {
      db.run(
        'UPDATE amazonOrders SET reconciled = 1 WHERE id = ?',
        orderID,
        err => {
          if (err) {
            logger.log({
              level: 'error',
              message: `UNABLE TO SET RECONCILED TO TRUE FOR ORDER ID ${orderID}`
            });
          } else {
            logger.log({
              level: 'info',
              message: `Order ID ${orderID} marked as reconciled in local database`
            });
          }

          index + 1 === orderIDs.length && resolve();
        }
      );
    });
  });
};

module.exports = reconcile;
