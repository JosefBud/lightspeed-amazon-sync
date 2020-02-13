const axios = require('axios');
const logger = require('../../logger.js');
const credentials = {
  id: process.env.LIGHTSPEED_ID,
  secret: process.env.LIGHTSPEED_SECRET,
  refreshToken: process.env.LIGHTSPEED_REFRESH_TOKEN
};

const refreshToken = () => {
  return new Promise((resolve, reject) => {
    const tokenRequestBody = {
      grant_type: 'refresh_token',
      client_id: credentials.id,
      client_secret: credentials.secret,
      refresh_token: credentials.refreshToken
    };

    axios({
      url: 'https://cloud.lightspeedapp.com/oauth/access_token.php',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(tokenRequestBody)
    })
      .then(response => {
        typeof response.data.access_token == 'string' &&
          logger.log({
            level: 'info',
            message: 'Refresh token successfully pulled'
          });

        resolve(response.data.access_token);
      })
      .catch(error => {
        logger.log({
          level: 'error',
          message: 'REFRESH TOKEN WAS UNABLE TO BE PULLED'
        });
        reject(error);
      });
  });
};

module.exports = refreshToken;
