const axios = require('axios');
const url = 'https://www.greatfeathers.com/rest/default/V1';

const updatePrices = (inventory, magentoItems) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < magentoItems.length; i++) {
      setTimeout(() => {
        const magentoSKU = magentoItems[i].sku;
        if (inventory[magentoSKU]) {
          console.log(`${i}/${magentoItems.length}`);
          axios({
            method: 'put',
            url: `${url}/products/${magentoSKU}`,
            headers: {
              Authorization: `Bearer ${process.env.MAGENTO_TOKEN}`,
            },
            data: {
              product: {
                price: inventory[magentoSKU].price,
              },
            },
          })
            .then((response) => {
              console.log(response.status, magentoSKU, inventory[magentoSKU].price);
              if (i + 1 === magentoItems.length) {
                resolve(true);
              }
            })
            .catch((err) => console.log(err));
        } else {
          console.log(`NO MATCH FOUND FOR ${magentoSKU}`);
        }
      }, i * 250);
    }
  });
};

module.exports = updatePrices;
