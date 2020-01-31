require('dotenv').config();
const assert = require('assert');
const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
const getAccountID = require('../../../lib/functions/lightspeed/getAccountID.js');

let authHeader;
before(async () => {
  const accessToken = await refreshToken();
  authHeader = {
    Authorization: `Bearer ${accessToken}`
  };
});

describe("Lightspeed's account ID retrieval", () => {
  it('Returns the correct test ID', async () => {
    const accountID = await getAccountID(authHeader);
    assert.equal(accountID, process.env.LIGHTSPEED_ACCOUNT_ID);
  });

  it('Handles errors', async () => {
    try {
      await getAccountID();
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
