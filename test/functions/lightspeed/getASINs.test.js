require('dotenv').config();
const assert = require('assert');
const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
const getASINs = require('../../../lib/functions/lightspeed/getASINs.js');

let sales = [];
let expected;
let authHeader;
const accountID = process.env.LIGHTSPEED_ACCOUNT_ID;
before(async () => {
  const accessToken = await refreshToken();
  authHeader = {
    Authorization: `Bearer ${accessToken}`
  };
});

beforeEach(() => {
  sales = [
    {
      itemID: '65',
      qty: 1
    },
    {
      itemID: '66',
      qty: 1
    },
    {
      itemID: '67',
      qty: 1
    },
    {
      itemID: '66',
      qty: 2
    }
  ];

  expected = Array.from(sales);
  expected[0].ASIN = 'B00B364Z1U';
  expected[1].ASIN = 'B00B364Z4C';
  expected[2].ASIN = 'B00B364Z1K';
  expected[3].ASIN = 'B00B364Z4C';
});

describe('Getting ASINs for sold items', () => {
  it('Gets ASINs for an array of only items with ASINs assigned', async () => {
    sales = await getASINs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Gets ASINs for an array of mixed items; some with ASINs assigned and others without', async () => {
    sales.push({ itemID: '639', qty: 3 });
    expected.push({ itemID: '639', qty: 3, ASIN: '' });
    sales = await getASINs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Fails gracefully with an array of only items without ASINs assigned', async () => {
    sales = [
      {
        itemID: '639',
        qty: 3
      },
      {
        itemID: '637',
        qty: 2
      }
    ];
    expected = Array.from(sales);
    expected[0].ASIN = '';
    expected[1].ASIN = '';

    sales = await getASINs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Gets ASINs for a single item with ASIN assigned', async () => {
    sales.splice(0, 3);
    expected = Array.from(sales);
    expected[0].ASIN = 'B00B364Z4C';

    sales = await getASINs(authHeader, accountID, sales);
    assert.deepEqual(sales, expected);
  });

  it('Gets ASINs for a single item without ASIN assigned', async () => {
    sales = [{ itemID: '637', qty: 2 }];
    expected = Array.from(sales);
    expected[0].ASIN = '';

    sales = await getASINs(authHeader, accountID, sales);
    assert.deepEqual(sales, expected);
  });

  it('Fails gracefully with an error', async () => {
    try {
      await getASINs(authHeader, 0, []);
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
