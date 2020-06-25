require('dotenv').config();
const assert = require('assert');
const mock = require('mock-require');
const sinon = require('sinon');
const amazonMWSMock = require('../../__mocks__/amazon-mws.js');
let getOrderIDs = require('../../../lib/functions/amazon/getOrderIDs.js');
let logger = require('../../../lib/logger.js');
const mockAuthHeader = {
  Authorization: 'Bearer 1234567890123456789012345678901234567890'
};
describe('Getting order IDs from Amazon (getOrderIDs)', () => {
  before(() => {
    mock('amazon-mws', amazonMWSMock);
    getOrderIDs = mock.reRequire(
      '../../../lib/functions/amazon/getOrderIDs.js'
    );
    sinon.spy(logger, 'log');
  });
  after(() => {
    logger.log.restore();
  });
  it('Successfully grabs a single order', async () => {
    process.env.MWS_SELLER_ID = 'one order';
    const orderIDs = await getOrderIDs(
      mockAuthHeader,
      process.env.LIGHTSPEED_ACCOUNT_ID,
      15
    );
    assert.equal(orderIDs[0], '002-0000002-0000002');
    assert.equal(orderIDs[1], undefined);
  });
  it('Logs properly after successful call', () => {
    assert.equal(
      logger.log.lastCall.lastArg.message,
      'Amazon order ID 002-0000002-0000002 pulled'
    );
  });

  it('Handles errors', async () => {
    process.env.MWS_SELLER_ID = 'nothing';
    try {
      await getOrderIDs(null, null, 15);
    } catch (err) {
      assert.equal(err.isError, true);
    }
  });
});
