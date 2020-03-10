const axios = request => {
  let { url, method, headers, data } = request;
  return new Promise((resolve, reject) => {
    if (url === 'https://cloud.lightspeedapp.com/oauth/access_token.php') {
      if (
        method === 'post' &&
        headers['Content-Type'] === 'application/json' &&
        typeof data === 'string'
      ) {
        data = JSON.parse(data);
        const { grant_type, client_id, client_secret, refresh_token } = data;
        if (
          grant_type === 'refresh_token' &&
          client_id === process.env.LIGHTSPEED_ID &&
          client_secret === process.env.LIGHTSPEED_SECRET &&
          refresh_token === process.env.LIGHTSPEED_REFRESH_TOKEN
        ) {
          resolve({
            data: {
              access_token: '1234567890123456789012345678901234567890'
            }
          });
        }
      }
    }

    reject({
      isAxiosError: true
    });
  });
};

module.exports = axios;
