const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getSales = (authHeader, accountID, timeRange) => {
  return new Promise((resolve, reject) => {
    const loadRelations = ['SaleLines'];
    let endDate = new Date();
    let beginDate = new Date();
    beginDate.setMinutes(beginDate.getMinutes() - timeRange);
    endDate = endDate.toISOString();
    beginDate = beginDate.toISOString();
    axios({
      url: `${lightspeedApi}/Account/${accountID}/Sale.json?load_relations=${JSON.stringify(
        loadRelations
      )}&timeStamp=><,${beginDate},${endDate}`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        //console.log(response.data);
        resolve(response.data);
      })
      .catch(err => reject(err));
  });
};

module.exports = getSales;
