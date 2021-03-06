const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const addOrders = require('../database/addOrders.js');
const reverseCanceledOrders = require('../database/reverseCanceledOrders.js');
const logger = require('../../logger.js');

const getOrderIDs = (authHeader, accountID, time) => {
  return new Promise(async (resolve, reject) => {
    /* let createdBeforeDate = new Date();
    let createdAfterDate = new Date();
    createdAfterDate.setMinutes(createdAfterDate.getMinutes() - time);
    // there are issues with their time syncing, so we're working 5 minutes behind to avoid that
    createdBeforeDate.setMinutes(createdBeforeDate.getMinutes() - 5);
    createdBeforeDate = createdBeforeDate.toISOString();
    createdAfterDate = createdAfterDate.toISOString(); */

    let lastUpdatedAfterDate = new Date();
    lastUpdatedAfterDate.setMinutes(lastUpdatedAfterDate.getMinutes() - time);
    lastUpdatedAfterDate = lastUpdatedAfterDate.toISOString();

    amazonMws.orders.search(
      {
        Version: '2013-09-01',
        Action: 'ListOrders',
        SellerId: process.env.MWS_SELLER_ID,
        MWSAuthToken: process.env.MWS_AUTH_TOKEN,
        'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
        LastUpdatedAfter: lastUpdatedAfterDate
        //CreatedBefore: createdBeforeDate
      },
      async (error, response) => {
        if (error) {
          logger.log({
            level: 'error',
            message: 'UNABLE TO RETRIEVE ORDER IDS FROM AMAZON'
          });
          reject(error);
          return;
        }
        const orders = response.Orders.Order;
        let orderIDs = [];
        let orderObjects = [];
        if (orders && orders[0]) {
          orders.forEach(async order => {
            if (
              order.OrderStatus !== 'Canceled' &&
              order.OrderStatus !== 'Shipped' &&
              order.OrderStatus !== 'PartiallyShipped'
            ) {
              orderIDs.push(order.AmazonOrderId);
              orderObjects.push({
                id: order.AmazonOrderId,
                purchaseDate: order.PurchaseDate,
                status: order.OrderStatus
              });
              logger.log({
                level: 'info',
                message: `Amazon order ID ${order.AmazonOrderId} pulled`
              });
            } else if (order.OrderStatus === 'Canceled') {
              await reverseCanceledOrders(
                authHeader,
                accountID,
                order.AmazonOrderId
              );
            }
          });
        } else if (orders) {
          if (
            orders.OrderStatus !== 'Canceled' &&
            orders.OrderStatus !== 'Shipped' &&
            orders.OrderStatus !== 'PartiallyShipped'
          ) {
            orderIDs = [orders.AmazonOrderId];
            orderObjects = [
              {
                id: orders.AmazonOrderId,
                purchaseDate: orders.PurchaseDate,
                status: orders.OrderStatus
              }
            ];
            logger.log({
              level: 'info',
              message: `Amazon order ID ${orders.AmazonOrderId} pulled`
            });
          } else if (orders.OrderStatus === 'Canceled') {
            await reverseCanceledOrders(
              authHeader,
              accountID,
              orders.AmazonOrderId
            );
          }
        } else {
          logger.log({
            level: 'info',
            message: 'No Amazon orders retrieved, but query was successful'
          });
        }
        orderObjects.length > 0 && (await addOrders(orderObjects));
        resolve(orderIDs);
      }
    );
    return;
  });
};

module.exports = getOrderIDs;
