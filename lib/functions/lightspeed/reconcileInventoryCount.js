const axios = require('axios');
const logger = require('../../logger.js');
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
          const reconcile = response.data.InventoryCountReconcile;
          setTimeout(() => {
            logger.log({
              level: 'info',
              message: `Inventory count (ID: ${reconcile.inventoryCountID}) was successfully completed and reconciled. Total QOH change was ${reconcile.qohChange}.`
            });
            resolve();
          }, 2000);
        })
        .catch(err => {
          logger.log({
            level: 'error',
            message: 'INVENTORY COUNT WAS UNABLE TO BE RECONCILED'
          });
          console.error(err);
        });
    }, 2000);
  });
};

module.exports = reconcileInventoryCount;
