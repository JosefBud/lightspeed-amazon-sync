require('dotenv').config();
const assert = require('assert');
const refreshToken = require('../../../lib/functions/lightspeed/refreshToken.js');
const getSKUs = require('../../../lib/functions/lightspeed/getSKUs.js');

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
  expected[0].SKU = 'B00B364Z1U';
  expected[1].SKU = 'B00B364Z4C';
  expected[2].SKU = 'B00B364Z1K';
  expected[3].SKU = 'B00B364Z4C';
});

describe('Getting SKUs for sold items', () => {
  it('Gets SKUs for an array of only items with SKUs assigned', async () => {
    sales = await getSKUs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Gets SKUs for an array of mixed items; some with SKUs assigned and others without', async () => {
    sales.push({ itemID: '639', qty: 3 });
    expected.push({ itemID: '639', qty: 3, SKU: '' });
    sales = await getSKUs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Fails gracefully with an array of only items without SKUs assigned', async () => {
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
    expected[0].SKU = '';
    expected[1].SKU = '';

    sales = await getSKUs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Gets SKUs for a single item with SKU assigned', async () => {
    sales.splice(0, 3);
    expected = Array.from(sales);
    expected[0].SKU = 'B00B364Z4C';

    sales = await getSKUs(authHeader, accountID, sales);
    assert.deepEqual(sales, expected);
  });

  it('Gets SKUs for a single item without SKU assigned', async () => {
    sales = [{ itemID: '637', qty: 2 }];
    expected = Array.from(sales);
    expected[0].SKU = '';

    sales = await getSKUs(authHeader, accountID, sales);
    assert.deepEqual(sales, expected);
  });

  it('Fails gracefully with an error', async () => {
    try {
      await getSKUs(authHeader, 0, []);
    } catch (err) {
      assert.equal(err.isAxiosError, true);
    }
  });
});
