const path = require('path');
const fs = require('fs');

const invoiceCreator = orderInfo => {
  return new Promise(async (resolve, reject) => {
    const htmlPath = path.resolve(__dirname, 'printer.html');
    let template = await fs.readFileSync(htmlPath, { encoding: 'UTF8' });
    template.replace('{name}', orderInfo.name);
    resolve();
  });
};

invoiceCreator();

module.exports = invoiceCreator;
