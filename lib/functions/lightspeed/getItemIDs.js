const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getItemIDs = (authHeader, accountID, orderItems) => {
  return new Promise((resolve, reject) => {
    let itemSKUs = [];
    orderItems.forEach(item => {
      itemSKUs.push(item.itemSKU);
    });

    const loadRelations = ['ItemShops'];
    axios({
      url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
        loadRelations
      )}&customSku=IN,${itemSKUs}`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        const items = response.data.Item;
        if (items[0]) {
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
        } else {
          orderItems.forEach((orderItem, index) => {
            if (items.customSku === orderItem.itemSKU) {
              orderItems[index] = {
                ...orderItems[index],
                itemID: items.itemID,
                currentQty: parseInt(items.ItemShops.ItemShop[0].sellable)
              };
            }
          });
        }

        resolve(orderItems);
      })
      .catch(err => reject(err));
  });
};

module.exports = getItemIDs;
