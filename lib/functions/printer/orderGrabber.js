const SQLite = require('sqlite3');
const path = require('path');
const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const logger = require('../../logger.js');

const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const db = new SQLite.Database(dbPath);

db.all(
  'SELECT * FROM amazonOrders WHERE printed = 0 AND status = ?',
  'Unshipped',
  (err, rows) => {
    if (err) {
      logger.log({
        level: 'error',
        message: `UNABLE TO PULL UNPRINTED ORDERS FROM LOCAL DATABASE`
      });
    }

    if (rows[0]) {
      rows.forEach((row, index) => {
        setTimeout(() => {
          amazonMws.orders.search(
            {
              Version: '2013-09-01',
              Action: 'GetOrder',
              SellerId: process.env.MWS_SELLER_ID,
              MWSAuthToken: process.env.MWS_AUTH_TOKEN,
              'AmazonOrderId.Id.1': row.id
            },
            async (error, response) => {
              console.log(response);
            }
          );
        }, 2000 * (index + 1));
      });
    } else {
      logger.log({
        level: 'info',
        message: 'There are no new orders to be printed'
      });
    }
  }
);
