const axios = require('axios');
const logger = require('../../logger.js');
const lightspeedApi = 'https://api.lightspeedapp.com/API';

const parseSalesLines = salesLines => {
  let salesLinesParsed = [];

  if (salesLines[0]) {
    // If there's multiple items in the sale
    salesLines.forEach(item => {
      salesLinesParsed.push({
        itemID: item.itemID,
        qty: parseInt(item.unitQuantity)
      });
    });
    return salesLinesParsed;
  } else {
    // If there's only one item in the sale
    salesLinesParsed.push({
      itemID: salesLines.itemID,
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
          logger.log({
            level: 'info',
            message: `Sale ID ${sale.saleID} has been parsed`
          });
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
        logger.log({
          level: 'info',
          message: `Sale ID ${Sales.saleID} has been parsed`
        });
      } else {
        resolve(salesParsed);
        return;
      }
    }

    logger.log({
      level: 'info',
      message: `${salesParsed.length} items were parsed out of the Lightspeed sales`
    });
    resolve(salesParsed);
  });
};

module.exports = parseSales;
