const assert = require('assert');
const parseSales = require('../../../lib/functions/lightspeed/parseSales.js');

const salesRawTemplate = {
  '@attributes': {
    count: '0',
    offset: '0',
    limit: '100'
  },
  Sale: {
    completed: 'true',
    SaleLines: {
      SaleLine: {
        itemID: '1',
        unitQuantity: '1'
      }
    }
  }
};

let salesRaw = {};
beforeEach(() => {
  salesRaw = {};
  Object.assign(salesRaw, salesRawTemplate);
});

describe("Lightspeed's sales parse function", () => {
  it('Correctly parses a range with no sales', async () => {
    delete salesRaw.Sale;

    const sales = await parseSales(salesRaw);
    assert.equal(sales.length, 0);
  });

  it('Correctly parses a range with 1 sale of 1 item', async () => {
    salesRaw['@attributes'].count = '1';
    salesRaw.Sale.SaleLines.SaleLine = {
      itemID: '60',
      unitQuantity: '1'
    };

    const sales = await parseSales(salesRaw);
    const expected = [{ itemId: '60', qty: 1 }];
    assert.equal(sales[0].itemId, expected[0].itemId);
    assert.equal(sales[0].qty, expected[0].qty);
  });

  it('Correctly parses a range with 1 sale of multiple items', async () => {
    salesRaw['@attributes'].count = '1';
    salesRaw.Sale.SaleLines.SaleLine = [
      {
        itemID: '60',
        unitQuantity: '1'
      },
      {
        itemID: '61',
        unitQuantity: '2'
      }
    ];

    const sales = await parseSales(salesRaw);
    const expected = [
      { itemId: '60', qty: 1 },
      { itemId: '61', qty: 2 }
    ];
    assert.equal(sales[0].itemId, expected[0].itemId);
    assert.equal(sales[1].itemId, expected[1].itemId);
    assert.equal(sales[0].unitQuantity, expected[0].unitQuantity);
    assert.equal(sales[1].unitQuantity, expected[1].unitQuantity);
  });

  it('Correctly parses a range with multiple sales of 1 item', async () => {
    salesRaw['@attributes'].count = '2';
    salesRaw.Sale = [
      {
        completed: 'true',
        SaleLines: {
          SaleLine: {
            itemID: '60',
            unitQuantity: '1'
          }
        }
      },
      {
        completed: 'true',
        SaleLines: {
          SaleLine: {
            itemID: '61',
            unitQuantity: '2'
          }
        }
      }
    ];

    const sales = await parseSales(salesRaw);
    const firstExpected = { itemId: '60', qty: 1 };
    const secondExpected = { itemId: '61', qty: 2 };
    assert.equal(sales[0].itemId, firstExpected.itemId);
    assert.equal(sales[1].itemId, secondExpected.itemId);
    assert.equal(sales[0].qty, firstExpected.qty);
    assert.equal(sales[1].qty, secondExpected.qty);
  });

  it('Correctly parses a range with multiple sales of multiple items', async () => {
    salesRaw['@attributes'].count = '2';
    salesRaw.Sale = [
      {
        completed: 'true',
        SaleLines: {
          SaleLine: [
            {
              itemID: '60',
              unitQuantity: '1'
            },
            {
              itemID: '61',
              unitQuantity: '2'
            }
          ]
        }
      },
      {
        completed: 'true',
        SaleLines: {
          SaleLine: [
            {
              itemID: '62',
              unitQuantity: '3'
            },
            {
              itemID: '63',
              unitQuantity: '4'
            }
          ]
        }
      }
    ];

    const sales = await parseSales(salesRaw);
    const expected = [
      { itemId: '60', qty: 1 },
      { itemId: '61', qty: 2 },
      { itemId: '62', qty: 3 },
      { itemId: '63', qty: 4 }
    ];
    sales.forEach((sale, index) => {
      assert.equal(sale.itemId, expected[index].itemId);
      assert.equal(sale.qty, expected[index].qty);
    });
  });

  it('Rejects incomplete sales', async () => {
    salesRaw['@attributes'].count = '2';
    salesRaw.Sale = [
      {
        completed: 'false',
        SaleLines: {
          SaleLine: {
            itemID: '60',
            unitQuantity: '1'
          }
        }
      },
      {
        completed: 'true',
        SaleLines: {
          SaleLine: {
            itemID: '61',
            unitQuantity: '2'
          }
        }
      }
    ];

    const sales = await parseSales(salesRaw);
    const expected = [{ itemId: '61', qty: 2 }];
    assert.equal(sales[0].itemId, expected[0].itemId);
    assert.equal(sales[0].qty, expected[0].qty);
    assert.equal(sales[1], null);
  });

  it('Rejects a single incomplete sale', async () => {
    salesRaw['@attributes'].count = '2';
    salesRaw.Sale = {
      completed: 'false',
      SaleLines: {
        SaleLine: {
          itemID: '60',
          unitQuantity: '1'
        }
      }
    };

    const sales = await parseSales(salesRaw);
    assert.equal(sales.length, 0);
  });
});
