const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);

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
          (error, response) => {
            if (error) {
              console.log('error ', error);
              reject(error);
              return;
            }
            const orderItemsRaw = response.OrderItems.OrderItem;
            console.log(response.OrderItems);
            if (orderItemsRaw && orderItemsRaw[0]) {
              orderItemsRaw.forEach(item => {
                orderItems.push({
                  itemASIN: item.ASIN,
                  qty: parseInt(item.QuantityOrdered)
                });
              });
            } else if (orderItemsRaw) {
              orderItems.push({
                itemASIN: orderItemsRaw.ASIN,
                qty: parseInt(orderItemsRaw.QuantityOrdered)
              });
            }

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
