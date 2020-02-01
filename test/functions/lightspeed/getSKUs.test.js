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
      qty: 3
    },
    {
      itemID: '66',
      qty: 0
    },
    {
      itemID: '67',
      qty: 0
    },
    {
      itemID: '66',
      qty: 0
    }
  ];

  expected = Array.from(sales);
  expected[0].SKU = '22789';
  expected[1].SKU = '22790';
  expected[2].SKU = '22791';
  expected.splice(3, 1);
});

describe('Getting SKUs for sold items', () => {
  it('Gets SKUs for an array of only items with SKUs assigned', async () => {
    sales = await getSKUs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Gets SKUs for an array of mixed items; some with SKUs assigned and others without', async () => {
    sales.push({ itemID: '639', qty: 2 });
    expected.push({ itemID: '639', qty: 2, SKU: '' });
    sales = await getSKUs(authHeader, accountID, sales);

    assert.deepEqual(sales, expected);
  });

  it('Fails gracefully with an array of only items without SKUs assigned', async () => {
    sales = [
      {
        itemID: '637',
        qty: 1
      },
      {
        itemID: '639',
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
    expected[0].SKU = '22790';

    sales = await getSKUs(authHeader, accountID, sales);
    assert.deepEqual(sales, expected);
  });

  it('Gets SKUs for a single item without SKU assigned', async () => {
    sales = [{ itemID: '637', qty: 1 }];
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
