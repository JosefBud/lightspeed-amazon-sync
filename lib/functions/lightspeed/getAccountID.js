const axios = require('axios');
const logger = require('../../logger.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const getAccountID = authHeader => {
  return new Promise((resolve, reject) => {
    axios({
      url: `${lightspeedApi}/Account.json`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        response.data.Account.accountID
          ? logger.log({
              level: 'info',
              message: 'Account ID successfully retrieved'
            })
          : logger.log({
              level: 'error',
              message: 'ACCOUNT ID VARIABLE DOES NOT EXIST IN RESPONSE'
            });
        resolve(response.data.Account.accountID);
      })
      .catch(err => {
        logger.log({
          level: 'error',
          message: 'ACCOUNT ID WAS UNABLE TO BE RETRIEVED'
        });
        reject(err);
      });
  });
};

module.exports = getAccountID;
