const amazonMws = require('amazon-mws')(
  process.env.MWS_ACCESS_KEY_ID,
  process.env.MWS_SECRET_ACCESS_KEY
);
const logger = require('../../logger.js');

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
          logger.log({
            level: 'error',
            message: 'INVENTORY UPDATE FEED WAS UNABLE TO BE SUBMITTED'
          });
          console.error('error ', error);
          reject(error);
          return;
        }

        logger.log({
          level: 'info',
          message: `Inventory update feed was successfully submitted to Amazon, with the feed ID ${response.FeedSubmissionInfo.FeedSubmissionId}`
        });
        //console.log('response', response);
        resolve(response);
      }
    );
  });
};

module.exports = submitInventoryFeed;
