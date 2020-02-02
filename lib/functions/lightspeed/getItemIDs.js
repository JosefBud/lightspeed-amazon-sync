const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getItemIDs = (authHeader, accountID, orderItems) => {
  return new Promise((resolve, reject) => {
    let itemSKUs = [];
    orderItems.forEach(item => {
      itemSKUs.push(item.itemSKU);
    });

    const loadRelations = ['ItemShops'];

    itemSKUs.forEach((itemSKU, itemSKUsIndex) => {
      setTimeout(() => {
        axios({
          url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
            loadRelations
          )}&customSku=${itemSKU}`,
          method: 'get',
          headers: authHeader
        })
          .then(response => {
            const items = response.data.Item;
            if (items && items[0]) {
              items.forEach(item => {
                orderItems.forEach((orderItem, index) => {
                  if (item.customSku === orderItem.itemSKU) {
                    orderItems[index] = {
                      ...orderItems[index],
                      itemID: item.itemID,
                      currentQty: parseInt(item.ItemShops.ItemShop[0].sellable)
                    };
                  }
                });
              });
            } else if (items) {
              orderItems.forEach((orderItem, index) => {
                if (items.customSku === orderItem.itemSKU) {
                  orderItems[index] = {
                    ...orderItems[index],
                    itemID: items.itemID,
                    currentQty: parseInt(items.ItemShops.ItemShop[0].sellable)
                  };
                }
              });
            } else {
              orderItems = undefined;
            }

            if (itemSKUsIndex + 1 === itemSKUs.length) {
              resolve(orderItems);
            }
          })
          .catch(err => reject(err));
      }, 2000 * itemSKUsIndex);
    });
  });
};

module.exports = getItemIDs;
