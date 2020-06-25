const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);

const pushItems = (order, items) => {
  order = {
    ...order,
    items: items
  };

  return order;
};

const orderItemGrabber = orders => {
  return new Promise((resolve, reject) => {
    let ordersWithItems = [];
    orders.forEach((order, index) => {
      setTimeout(() => {
        amazonMws.orders.search(
          {
            Version: '2013-09-01',
            Action: 'ListOrderItems',
            SellerId: process.env.MWS_SELLER_ID,
            MWSAuthToken: process.env.MWS_AUTH_TOKEN,
            AmazonOrderId: order.id
          },
          async (error, response) => {
            if (error) {
              logger.log({
                level: 'error',
                message: `UNABLE TO RETRIEVE ORDER ITEMS FOR ORDER ID ${order.id} FOR PRINTING`
              });
              return;
            }
            const orderItemsRaw = response.OrderItems.OrderItem;
            //console.log(orderItemsRaw);
            if (orderItemsRaw && orderItemsRaw[0]) {
              /* let items = [];
              orderItemsRaw.forEach(item => {
                items.push(item);
              }); */
              ordersWithItems.push(pushItems(order, orderItemsRaw));
            } else if (orderItemsRaw) {
              let items = [];
              items.push(orderItemsRaw);
              ordersWithItems.push(pushItems(order, items));
            }

            orders.length === index + 1 && resolve(ordersWithItems);
          }
        );
      }, 2000 * (index + 1));
    });
  });
};

module.exports = orderItemGrabber;
