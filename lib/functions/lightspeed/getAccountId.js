const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getAccountId = authHeader => {
  return new Promise((resolve, reject) => {
    axios({
      url: `${lightspeedApi}/Account.json`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        resolve(response.data.Account.accountID);
      })
      .catch(err => reject(err));
  });
};

module.exports = getAccountId;
