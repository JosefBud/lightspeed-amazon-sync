require('dotenv').config();
const assert = require('assert');
const decache = require('decache');
const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
const getAccountId = require('../../../lib/functions/lightspeed/getAccountId.js');

let authHeader;
before(async () => {
  const accessToken = await refreshToken();
  authHeader = {
    Authorization: `Bearer ${accessToken}`
  };
});

describe("Lightspeed's account ID retrieval", () => {
  it('Returns the correct test ID', async () => {
    const accountId = await getAccountId(authHeader);
    assert.equal(accountId, process.env.LIGHTSPEED_ACCOUNT_ID);
  });

  it('Handles errors', async () => {
    const getAccountId = require('../../../lib/functions/lightspeed/getAccountId.js');
    try {
      await getAccountId();
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
