require('dotenv').config();
const assert = require('assert');
const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
const getSales = require('../../../lib/functions/lightspeed/getSales.js');

let authHeader;
before(async () => {
  const accessToken = await refreshToken();
  authHeader = {
    Authorization: `Bearer ${accessToken}`
  };
});

describe('Getting Lightspeed sales', () => {
  it('Returns a successful call', async () => {
    const salesRaw = await getSales(
      authHeader,
      process.env.LIGHTSPEED_ACCOUNT_ID,
      60
    );
    assert.ok(salesRaw['@attributes']);
  });

  it('Handles errors', async () => {
    try {
      await getSales(0, 0, 60);
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
