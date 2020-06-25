const amazonOrders = require('./data/amazonOrders.json');
const amazonItems = require('./data/amazonItems.json');

const amazonMWS = {
  orders: {
    search: function(request, callback) {
      const {
        Version,
        Action,
        SellerId,
        MWSAuthToken,
        LastUpdatedAfter
      } = request;
      if (Action === 'ListOrders' && SellerId === 'one order') {
        const response = {
          Orders: {
            Order: amazonOrders[1]
          }
        };
        callback(null, response);
        return;
      }

      callback({ isError: true }, null);
      return;
    }
  }
};

module.exports = function(accessKeyID, secretAccessKey) {
  return amazonMWS;
};
