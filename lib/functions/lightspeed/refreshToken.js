const axios = require('axios');
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
        resolve(response.data.access_token);
      })
      .catch(error => {
        reject(error);
      });
  });
};

module.exports = refreshToken;
