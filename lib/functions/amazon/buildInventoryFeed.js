const builder = require('xmlbuilder');

const baseTemplate = {
  AmazonEnvelope: {
    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@xsi:noNamespaceSchemaLocation': 'amznenvelope.xsd',
    Header: {
      DocumentVersion: '1.01',
      MerchantIdentifier: process.env.MWS_SELLER_ID
    },
    MessageType: 'Inventory'
  }
};

const buildInventoryFeed = (sales, handlingTime) => {
  return new Promise((resolve, reject) => {
    const xml = builder.create(baseTemplate).declaration('1.0', 'utf-8');
    sales.forEach((item, index) => {
      const message = {
        Message: {
          MessageID: index + 1,
          OperationType: 'Update',
          Inventory: {
            SKU: item.SKU,
            Quantity: item.qty,
            FullfillmentLatency: handlingTime
          }
        }
      };
      xml.ele(message);
    });
    resolve(xml.end({ pretty: true }));
  });
};

module.exports = buildInventoryFeed;
