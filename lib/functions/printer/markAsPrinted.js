const SQLite = require('sqlite3');
const path = require('path');
const logger = require('../../logger.js');

const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const db = new SQLite.Database(dbPath);

const markAsPrinted = orderID => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE amazonOrders SET printed = 1 WHERE id = ?', orderID, err => {
      if (err) {
        logger.log({
          level: 'error',
          message: `UNABLE TO MARK ORDER ${orderID} AS PRINTED IN LOCAL DATABASE`
        });
      } else {
        logger.log({
          level: 'info',
          message: `Order ${orderID} marked as printed in local database`
        });
      }
    });
  });
};

module.exports = markAsPrinted;
