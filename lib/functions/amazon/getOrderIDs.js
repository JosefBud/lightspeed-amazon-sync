const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const logger = require('../../logger.js');

const getOrderIDs = time => {
  return new Promise((resolve, reject) => {
    let createdBeforeDate = new Date();
    let createdAfterDate = new Date();
    createdAfterDate.setMinutes(createdAfterDate.getMinutes() - time);
    // there are issues with their time syncing, so we're working 5 minutes behind to avoid that
    createdBeforeDate.setMinutes(createdBeforeDate.getMinutes() - 5);
    createdBeforeDate = createdBeforeDate.toISOString();
    createdAfterDate = createdAfterDate.toISOString();

    amazonMws.orders.search(
      {
        Version: '2013-09-01',
        Action: 'ListOrders',
        SellerId: process.env.MWS_SELLER_ID,
        MWSAuthToken: process.env.MWS_AUTH_TOKEN,
        'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
        CreatedAfter: createdAfterDate
        //CreatedBefore: createdBeforeDate
      },
      (error, response) => {
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
        if (orders && orders[0]) {
          orders.forEach(order => {
            orderIDs.push(order.AmazonOrderId);
            logger.log({
              level: 'info',
              message: `Amazon order ID ${order.AmazonOrderId} pulled`
            });
          });
        } else if (orders) {
          orderIDs = [orders.AmazonOrderId];
          logger.log({
            level: 'info',
            message: `Amazon order ID ${orders.AmazonOrderId} pulled`
          });
        } else {
          logger.log({
            level: 'info',
            message: 'No Amazon orders retrieved, but query was successful'
          });
        }
        resolve(orderIDs);
      }
    );
    return;
  });
};

module.exports = getOrderIDs;
