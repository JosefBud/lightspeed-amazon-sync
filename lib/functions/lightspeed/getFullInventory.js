const axios = require('axios');
const fs = require('fs');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getFullInventory = (authHeader, accountID) => {
  return new Promise((resolve, reject) => {
    axios({
      url: `${lightspeedApi}/Account/${accountID}/Item.json?customSku=!~,`,
      //url: `${lightspeedApi}/Account/${accountID}/Item.json`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        const totalItems = parseInt(response.data['@attributes'].count);
        const numberOfQueries = Math.ceil(totalItems / 100);
        const loadRelations = ['ItemShops'];
        let fullInventory = [];
        for (let i = 0; i < numberOfQueries; i++) {
          setTimeout(() => {
            axios({
              url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
                loadRelations
              )}&offset=${i * 100}&customSku=!~,`,
              /* url: `${lightspeedApi}/Account/${accountID}/Item.json?load_relations=${JSON.stringify(
                loadRelations
              )}&offset=${i * 100}`, */
              method: 'get',
              headers: authHeader
            })
              .then(response => {
                console.log(`adding items ${i * 100} through ${(i + 1) * 100}`);
                const items = response.data.Item;
                items[0]
                  ? (fullInventory = fullInventory.concat(items))
                  : fullInventory.push(items);

                if (i + 1 === numberOfQueries) {
                  resolve(fullInventory);
                }
              })
              .catch(err => console.log(err));
          }, 2000 * i);
        }
      })
      .catch(err => console.log(err));

    return;
  });
};

module.exports = getFullInventory;
