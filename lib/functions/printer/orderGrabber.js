const SQLite = require('sqlite3');
const path = require('path');
const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const logger = require('../../logger.js');

const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const db = new SQLite.Database(dbPath);

const orderGrabber = () => {
  return new Promise((resolve, reject) => {
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

        let orders = [];
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
                  if (error) {
                    logger.log({
                      level: 'error',
                      message: `UNABLE TO GET ORDER ID ${row.id} FROM AMAZON API FOR PRINTING`
                    });
                    console.log(error);
                    return;
                  }
                  const order = response.Orders.Order;
                  let orderInfo = {
                    name: order.ShippingAddress.Name,
                    address: order.ShippingAddress,
                    id: order.AmazonOrderId,
                    orderDate: order.PurchaseDate,
                    shippingService: order.ShipmentServiceLevelCategory,
                    orderTotal: order.OrderTotal.Amount
                  };
                  orders.push(orderInfo);

                  logger.log({
                    level: 'info',
                    message: `Pulled basic order information for order ${row.id} for printing`
                  });
                  rows.length === index + 1 && resolve(orders);
                }
              );
            }, 2000 * (index + 1));
          });
        } else {
          logger.log({
            level: 'info',
            message: 'There are no new orders to be printed'
          });
          resolve(orders);
        }
      }
    );
  });
};

module.exports = orderGrabber;
