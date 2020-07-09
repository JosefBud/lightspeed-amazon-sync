const axios = require('axios');
const url = 'https://www.greatfeathers.com/rest/default/V1/products';

const getItemList = () => {
  return new Promise((resolve, reject) => {
    console.log('getting item list from Magento, this will take a while');
    axios({
      method: 'get',
      url: `${url}?searchCriteria={currentPage: 0}`,
      headers: {
        Authorization: `Bearer ${process.env.MAGENTO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      const { items } = res.data;
      let itemList = [];

      for (let i = 0; i < items.length; i++) {
        itemList.push({ sku: items[i].sku, price: items[i].price });
      }

      for (let a = 0; a < itemList.length; a++) {
        itemList[a];
      }

      resolve(itemList);
    });
  });
};

module.exports = getItemList;
