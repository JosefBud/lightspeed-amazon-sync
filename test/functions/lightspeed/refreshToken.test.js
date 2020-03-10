require('dotenv').config();
const assert = require('assert');
const mock = require('mock-require');
const axiosMock = require('../../__mocks__/axios.js');

let refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');

/* let accessToken;
beforeEach(async () => {
  accessToken = await refreshToken();
}); */

describe("Lightspeed's refresh token function", () => {
  beforeEach(() => {
    mock('axios', axiosMock);
    refreshToken = mock.reRequire(
      '../../../lib/functions/lightspeed/refreshToken.js'
    );
  });
  it('Returns a token string', async () => {
    const accessToken = await refreshToken();
    console.log(accessToken);
    assert.equal(typeof accessToken, 'string');
    assert.equal(accessToken.length, 40);
  });

  it('Handles errors', async () => {
    delete process.env.LIGHTSPEED_ID;
    delete process.env.LIGHTSPEED_SECRET;
    delete process.env.LIGHTSPEED_REFRESH_TOKEN;
    try {
      await refreshToken();
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
