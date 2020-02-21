const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const sqlite = require('sqlite3');
const db = new sqlite.Database('../db/amazonOrders.sqlite');

db.run(
  'CREATE TABLE amazonOrders (id TEXT PRIMARY KEY, purchaseDate TEXT, status TEXT, items TEXT, reconciled INTEGER)'
);

let lastUpdatedAfterDate = new Date();
lastUpdatedAfterDate.setMinutes(lastUpdatedAfterDate.getMinutes() - 60 * 48);
lastUpdatedAfterDate = lastUpdatedAfterDate.toISOString();

amazonMws.orders.search(
  {
    Version: '2013-09-01',
    Action: 'ListOrders',
    SellerId: process.env.MWS_SELLER_ID,
    MWSAuthToken: process.env.MWS_AUTH_TOKEN,
    'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
    LastUpdatedAfter: lastUpdatedAfterDate
  },
  async (error, response) => {
    if (error) {
      console.log(error);
      return;
    }
    const orders = response.Orders.Order;
    let orderIDs = [];
    orders.forEach(order => {
      orderIDs.push(order.AmazonOrderId);
      db.run(
        'INSERT INTO amazonOrders (id, purchaseDate, status, items, reconciled) VALUES ($id, $purchaseDate, $status, $items, $reconciled)',
        {
          $id: order.AmazonOrderId,
          $purchaseDate: order.PurchaseDate,
          $status: order.OrderStatus,
          $items: null,
          $reconciled: 1
        }
      );
    });

    orderIDs.forEach((orderID, index) => {
      setTimeout(() => {
        amazonMws.orders.search(
          {
            Version: '2013-09-01',
            Action: 'ListOrderItems',
            SellerId: process.env.MWS_SELLER_ID,
            MWSAuthToken: process.env.MWS_AUTH_TOKEN,
            AmazonOrderId: orderID
          },
          (error, response) => {
            if (error) {
              console.log(error);
              return;
            }
            const orderItemsRaw = response.OrderItems.OrderItem;
            let items = [];
            if (orderItemsRaw && orderItemsRaw[0]) {
              orderItemsRaw.forEach(item => {
                items.push({
                  itemSKU: item.SellerSKU,
                  itemTitle: item.Title,
                  qty: item.QuantityOrdered
                });
              });
            } else if (orderItemsRaw) {
              items.push({
                itemSKU: orderItemsRaw.SellerSKU,
                itemTitle: orderItemsRaw.Title,
                qty: orderItemsRaw.QuantityOrdered
              });
            }
            db.run('UPDATE amazonOrders SET items = $items WHERE id = $id', {
              $items: JSON.stringify(items),
              $id: orderID
            });
          }
        );
      }, 2000 * index);
    });
  }
);
