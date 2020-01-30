require('dotenv').config();
const assert = require('assert');
const decache = require('decache');

/* let accessToken;
beforeEach(async () => {
  accessToken = await refreshToken();
}); */

describe("Lightspeed's refresh token function", () => {
  it('Returns a token string', async () => {
    const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
    const accessToken = await refreshToken();
    assert.equal(typeof accessToken, 'string');
    assert.equal(accessToken.length, 40);
  });

  it('Handles errors', async () => {
    decache('../../../lib/functions/lightspeed/refreshToken.js');
    delete process.env.LIGHTSPEED_ID;
    delete process.env.LIGHTSPEED_SECRET;
    delete process.env.LIGHTSPEED_REFRESH_TOKEN;
    const badRefreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
    try {
      await badRefreshToken();
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
