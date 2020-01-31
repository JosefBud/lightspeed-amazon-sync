const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getASINs = (authHeader, accountID, sales) => {
  return new Promise((resolve, reject) => {
    let itemIDs = [];

    sales.forEach(sale => {
      itemIDs.push(sale.itemID);
    });

    axios({
      url: `${lightspeedApi}/Account/${accountID}/Item.json?itemID=IN,${itemIDs}`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        const items = response.data.Item;
        if (items[0]) {
          items.forEach(item => {
            sales.forEach((sale, index) => {
              if (sale.itemID === item.itemID) {
                sales[index] = {
                  ...sales[index],
                  ASIN: item.customSku
                };
              }
            });
          });
        } else {
          sales.forEach((sale, index) => {
            if (sale.itemID === items.itemID) {
              sales[index] = {
                ...sales[index],
                ASIN: items.customSku
              };
            }
          });
        }

        resolve(sales);
      })
      .catch(err => reject(err));
  });
};

module.exports = getASINs;
