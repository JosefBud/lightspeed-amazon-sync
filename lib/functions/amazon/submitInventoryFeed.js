const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);

const submitInventoryFeed = inventoryFeed => {
  return new Promise((resolve, reject) => {
    amazonMws.feeds.submit(
      {
        Version: '2009-01-01',
        Action: 'SubmitFeed',
        FeedType: '_POST_INVENTORY_AVAILABILITY_DATA_',
        FeedContent: inventoryFeed,
        SellerId: process.env.MWS_SELLER_ID,
        MWSAuthToken: process.env.MWS_AUTH_TOKEN
      },
      function(error, response) {
        if (error) {
          console.log('error ', error);
          return;
        }
        console.log('response', response);
        resolve(response);
      }
    );
  });
};

module.exports = submitInventoryFeed;
