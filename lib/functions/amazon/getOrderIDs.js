const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);

const getOrderIDs = () => {
  return new Promise((resolve, reject) => {
    let createdBeforeDate = new Date();
    let createdAfterDate = new Date();
    createdAfterDate.setMinutes(createdAfterDate.getMinutes() - 1000);
    // there are issues with their time syncing, so we're working an hour behind to avoid that
    createdBeforeDate.setMinutes(createdBeforeDate.getMinutes() - 60);
    createdBeforeDate = createdBeforeDate.toISOString();
    createdAfterDate = createdAfterDate.toISOString();

    amazonMws.orders.search(
      {
        Version: '2013-09-01',
        Action: 'ListOrders',
        SellerId: process.env.MWS_SELLER_ID,
        MWSAuthToken: process.env.MWS_AUTH_TOKEN,
        'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
        CreatedAfter: createdAfterDate,
        CreatedBefore: createdBeforeDate
      },
      (error, response) => {
        if (error) {
          console.log('error ', error);
          return;
        }
        const orders = response.Orders.Order;
        let orderIDs = [];
        if (orders && orders[0]) {
          orders.forEach(order => {
            orderIDs.push(order.AmazonOrderId);
          });
        } else if (orders) {
          orderIDs = [orders.AmazonOrderId];
        }
        resolve(orderIDs);
      }
    );
    return;
  });
};

module.exports = getOrderIDs;
