const SQLite = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../../db/amazonOrders.sqlite');
const logger = require('../../logger.js');
const db = new SQLite.Database(dbPath);

const addOrders = ordersObjects => {
  return new Promise((resolve, reject) => {
    ordersObjects.forEach((order, index) => {
      db.get(
        'SELECT * FROM amazonOrders WHERE id = ?',
        order.id,
        (err, row) => {
          if (row) {
            logger.log({
              level: 'info',
              message: `Order ${order.id} was already in the database, so it is not being added`
            });

            if (order.status !== row.status) {
              db.run(
                'UPDATE amazonOrders SET status = $status WHERE id = $id',
                {
                  $status: order.status,
                  $id: order.id
                },
                err => {
                  if (err) {
                    logger.log({
                      level: 'error',
                      message: `UNABLE TO UPDATE THE STATUS OF ORDER ${order.id} IN THE LOCAL DATABASE`
                    });
                  } else {
                    logger.log({
                      level: 'info',
                      message: `Changed the status of order ${order.id} from ${row.status} to ${order.status}`
                    });
                  }
                }
              );
            }
            index + 1 === ordersObjects.length && resolve();

            return;
          } else {
            db.run(
              'INSERT INTO amazonOrders (id, purchaseDate, status, items, reconciled) VALUES ($id, $purchaseDate, $status, $items, $reconciled)',
              {
                $id: order.id,
                $purchaseDate: order.purchaseDate,
                $status: order.status,
                $items: null,
                $reconciled: 0
              },
              err => {
                if (err) {
                  logger.log({
                    level: 'error',
                    message: `UNABLE TO ADD ORDER ${order.id} TO LOCAL DATABASE`
                  });
                  console.log(err);
                } else {
                  logger.log({
                    level: 'info',
                    message: `Order ${order.id} added to local database`
                  });
                }
                index + 1 === ordersObjects.length && resolve();
              }
            );
          }
        }
      );
    });
  });
};

module.exports = addOrders;
