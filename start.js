const axios = require('axios');
const refreshToken = require('./lib/functions/lightspeed/refreshToken.js');
const getAccountId = require('./lib/functions/lightspeed/getAccountId.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

(async () => {
  // refresh the token
  const accessToken = await refreshToken();
  if (typeof accessToken == 'string') {
    // creating the authentication header for all future API calls
    const authHeader = {
      Authorization: `Bearer ${accessToken}`
    };

    // getting the account ID
    const accountId = await getAccountId(authHeader);
  }
})();

/* 
const loadRelations = {
  load_relations: JSON.stringify(['CustomFieldValues'])
};

const value = 'CustomFieldValues.value=B00B364Z1U';

axios({
  url: `${lightspeedApi}/Account/${lightspeedAccountId}/Item.json?load_relations=${JSON.stringify(
    ['CustomFieldValues']
  )}&CustomFieldValues.value=B00B364Z1U`,
  method: 'get',
  headers: authHeader
  //params: loadRelations
})
  .then(response => {
    console.log(response.headers);
  })
  .catch(error => console.error(error));
 */
