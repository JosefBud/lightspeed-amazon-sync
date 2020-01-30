const axios = require('axios');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const parseSalesLines = salesLines => {
  let salesLinesParsed = [];

  if (salesLines[0]) {
    // If there's multiple items in the sale
    salesLines.forEach(item => {
      salesLinesParsed.push({
        itemId: item.itemID,
        qty: parseInt(item.unitQuantity)
      });
    });
    return salesLinesParsed;
  } else {
    // If there's only one item in the sale
    salesLinesParsed.push({
      itemId: salesLines.itemID,
      qty: parseInt(salesLines.unitQuantity)
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
  });
};

module.exports = parseSales;
