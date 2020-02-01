const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const reconcileInventoryCount = (authHeader, accountID, inventoryCountID) => {
  return new Promise((resolve, reject) => {
    const reconcileParams = {
      inventoryCountID: parseInt(inventoryCountID)
    };
    setTimeout(() => {
      axios({
        url: `${lightspeedApi}/Account/${accountID}/InventoryCountReconcile.json`,
        method: 'post',
        headers: authHeader,
        data: reconcileParams
      })
        .then(response => {
          console.log(response.data);
          setTimeout(() => {
            resolve();
          }, 2000);
        })
        .catch(err => console.log(err));
    }, 2000);
  });
};

module.exports = reconcileInventoryCount;
