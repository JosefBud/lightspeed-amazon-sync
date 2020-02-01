const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const reconcileInventoryCount = (authHeader, accountID, inventoryCountID) => {
  return new Promise((resolve, reject) => {
    const reconcileParams = {
      inventoryCountID: parseInt(inventoryCountID)
    };
    axios({
      url: `${lightspeedApi}/Account/${accountID}/InventoryCountReconcile.json`,
      method: 'post',
      headers: authHeader,
      data: reconcileParams
    })
      .then(response => {
        console.log(response.data);
        resolve();
      })
      .catch(err => console.log(err));
  });
};

module.exports = reconcileInventoryCount;
