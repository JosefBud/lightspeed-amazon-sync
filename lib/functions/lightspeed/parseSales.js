const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const parseSalesLines = salesLines => {
  let salesLinesParsed = [];

  if (salesLines[0]) {
    // If there's multiple items in the sale
    salesLines.forEach(item => {
      salesLinesParsed.push({
        itemId: item.itemID,
        qty: item.unitQuantity
      });
    });
    return salesLinesParsed;
  } else {
    // If there's only one item in the sale
    salesLinesParsed.push({
      itemId: salesLines.itemID,
      qty: salesLines.unitQuantity
    });
    return salesLinesParsed;
  }
};

const parseSales = salesRaw => {
  return new Promise((resolve, reject) => {
    if (salesRaw['@attributes'].count === '0') {
      resolve([]);
    }

    let salesParsed = [];

    const Sales = salesRaw.Sale;

    if (Sales[0]) {
      // If there are multiple sales
      Sales.forEach(sale => {
        if (sale.completed == 'true') {
          // If the sale is completed
          const SaleLines = sale.SaleLines.SaleLine;
          const parsed = parseSalesLines(SaleLines);
          salesParsed = salesParsed.concat(parsed);
        } else {
          // If the sale is incomplete
          return;
        }
      });
    } else {
      // If there is only a single sale
      if (Sales.completed == 'true') {
        // If the sale is completed
        const SaleLines = Sales.SaleLines.SaleLine;
        const parsed = parseSalesLines(SaleLines);
        salesParsed = salesParsed.concat(parsed);
      } else {
        resolve(salesParsed);
        return;
      }
    }

    resolve(salesParsed);

    /*     const SaleRaw = salesRaw.Sale;
    let sales = [];
    // multiple sales
    if (SaleRaw[0]) {
      SaleRaw.forEach(sale => {
        // sale is completed
        if (sale.completed == 'true') {
          const SaleLines = sale.SaleLines;
          // multiple items in the sale
          if (SaleLines && SaleLines[0]) {
            SaleLines.forEach(item => {
              sales.push({
                itemId: item.itemID,
                qty: parseInt(item.unitQuantity)
              });
            });
          // single item 
          } else if (SaleLines) {
            const SaleLine = SaleLines.SaleLine;
            if (SaleLine[0]) {
              SaleLine.forEach(item => {
                sales.push({
                  itemId: item.itemID,
                  qty: parseInt(item.unitQuantity)
                });
              });
            } else {
              sales.push({
                itemId: SaleLine.itemID,
                qty: parseInt(SaleLine.unitQuantity)
              });
            }
          } else {
            return;
          }

          resolve(sales);
        }
      });
    } else {
      if (SaleRaw.SaleLines && SaleRaw.SaleLines[0]) {
        const SaleLines = SaleRaw.SaleLines;
        SaleLines.forEach(item => {
          sales.push({
            itemId: item.itemID,
            qty: parseInt(item.unitQuantity)
          });
        });
      } else {
        sales.push({
          itemId: SaleRaw.SaleLines.SaleLine.itemID,
          qty: parseInt(SaleRaw.SaleLines.SaleLine.unitQuantity)
        });
      }

      resolve(sales);
    } */
  });
};

module.exports = parseSales;
