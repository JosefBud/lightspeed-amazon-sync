const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const addOrderItems = require('../database/addOrderItems.js');
const logger = require('../../logger.js');

const getOrderItems = orderIDs => {
  return new Promise((resolve, reject) => {
    let orderItems = [];
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
          async (error, response) => {
            if (error) {
              logger.log({
                level: 'error',
                message: `UNABLE TO RETRIEVE ORDER ITEMS FOR ORDER ID ${orderID}`
              });
              reject(error);
              return;
            }
            const orderItemsRaw = response.OrderItems.OrderItem;
            if (orderItemsRaw && orderItemsRaw[0]) {
              orderItemsRaw.forEach(item => {
                orderItems.push({
                  itemSKU: item.SellerSKU,
                  itemTitle: item.Title,
                  qty: parseInt(item.QuantityOrdered)
                });
                logger.log({
                  level: 'info',
                  message: `${item.Title} (SKU: ${item.SellerSKU}) (Qty: ${item.QuantityOrdered}) pulled from ${orderID}`
                });
              });
            } else if (orderItemsRaw) {
              orderItems.push({
                itemSKU: orderItemsRaw.SellerSKU,
                itemTitle: orderItemsRaw.Title,
                qty: parseInt(orderItemsRaw.QuantityOrdered)
              });

              logger.log({
                level: 'info',
                message: `${orderItemsRaw.Title} (SKU: ${orderItemsRaw.SellerSKU}) (Qty: ${orderItemsRaw.QuantityOrdered}) pulled from ${orderID}`
              });
            }

            await addOrderItems(orderItems, orderID);

            if (index + 1 === orderIDs.length) {
              resolve(orderItems);
            }
          }
        );
      }, index * 2000);
    });
  });
};

module.exports = getOrderItems;
