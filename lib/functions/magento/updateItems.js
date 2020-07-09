const axios = require('axios');
const url = 'https://www.greatfeathers.com/rest/default/V1';

const updateItems = (inventory, magentoItems) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < magentoItems.length; i++) {
      setTimeout(() => {
        const magentoSKU = magentoItems[i].sku;
        if (inventory[magentoSKU]) {
          console.log(`${i}/${magentoItems.length}`);

          axios({
            method: 'get',
            url: `${url}/stockItems/${magentoSKU}`,
            headers: {
              Authorization: `Bearer ${process.env.MAGENTO_TOKEN}`,
            },
          })
            .then((res) => {
              if (res.status === 200) {
                const itemID = res.data.item_id;

                axios({
                  method: 'put',
                  url: `${url}/products/${magentoSKU}/stockItems/${res.data.item_id}`,
                  headers: {
                    Authorization: `Bearer ${process.env.MAGENTO_TOKEN}`,
                  },
                  data: {
                    stock_item: {
                      qty: inventory[magentoSKU].qty,
                    },
                  },
                })
                  .then((response) => {
                    console.log(response.status, magentoSKU, inventory[magentoSKU].qty);
                    if (i + 1 === magentoItems.length) {
                      resolve(true);
                    }
                  })
                  .catch((err) => console.log(err));
              } else {
                console.log(`ISSUE WITH ${magentoSKU}`);
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

module.exports = updateItems;
