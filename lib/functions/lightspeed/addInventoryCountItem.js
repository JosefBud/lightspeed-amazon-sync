const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const addInventoryCountItem = (
  authHeader,
  accountID,
  item,
  inventoryCountID
) => {
  return new Promise((resolve, reject) => {
    const itemParams = {
      qty: item.currentQty - item.qty,
      inventoryCountID: inventoryCountID,
      itemID: parseInt(item.itemID),
      employeeID: 5
    };

    axios({
      url: `${lightspeedApi}/Account/${accountID}/InventoryCountItem.json`,
      method: 'post',
      headers: authHeader,
      data: itemParams
    })
      .then(response => {
        console.log(response.data);
        resolve(response.data);
      })
      .catch(err => console.log(err));
  });
};

module.exports = addInventoryCountItem;
