const axios = require('axios');
const lightspeedId = process.env.LIGHTSPEED_ID;
const lightspeedSecret = process.env.LIGHTSPEED_SECRET;
const lightspeedRefreshToken = process.env.LIGHTSPEED_REFRESH_TOKEN;
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const tokenRequestBody = {
  grant_type: 'refresh_token',
  client_id: lightspeedId,
  client_secret: lightspeedSecret,
  refresh_token: lightspeedRefreshToken
};

// refresh the token
axios({
  url: 'https://cloud.lightspeedapp.com/oauth/access_token.php',
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  data: JSON.stringify(tokenRequestBody)
})
  .then(response => {
    const lightspeedAccessToken = response.data.access_token;
    const authHeader = {
      Authorization: `Bearer ${lightspeedAccessToken}`
    };

    // get account ID using 'https://api.lightspeedapp.com/API/Account.json'
    axios({
      url: `${lightspeedApi}/Account.json`,
      method: 'get',
      headers: authHeader
    })
      .then(response => {
        let lightspeedAccountId;
        if (response.data.Account.accountID) {
          lightspeedAccountId = response.data.Account.accountID;
        } else {
          console.error(response.data);
          return;
        }

        const loadRelations = {
          load_relations: JSON.stringify(['CustomFieldValues'])
        };

        const value = 'CustomFieldValues.value=B00B364Z1U';

        axios({
          url: `${lightspeedApi}/Account/${lightspeedAccountId}/Item.json?load_relations=${JSON.stringify(
            ['CustomFieldValues']
          )}&CustomFieldValues.value=!~,`,
          method: 'get',
          headers: authHeader
          //params: loadRelations
        })
          .then(response => {
            console.log(response.data.Item[0].CustomFieldValues);
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
