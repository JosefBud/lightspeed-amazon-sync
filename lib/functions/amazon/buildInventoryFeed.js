const builder = require('xmlbuilder');
const logger = require('../../logger.js');

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

const buildInventoryFeed = (inventory, handlingTime) => {
  return new Promise((resolve, reject) => {
    const xml = builder.create(baseTemplate).declaration('1.0', 'utf-8');
    inventory.forEach((item, index) => {
      const message = {
        Message: {
          MessageID: index + 1,
          OperationType: 'Update',
          Inventory: {
            SKU: item.SKU,
            Quantity: item.qty,
            FulfillmentLatency: handlingTime
          }
        }
      };
      xml.ele(message);
    });
    logger.log({
      level: 'info',
      message:
        'Lightspeed inventory has been translated to an XML feed for Amazon'
    });
    resolve(xml.end({ pretty: true }));
  });
};

module.exports = buildInventoryFeed;
