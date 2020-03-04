const fs = require('fs');
const printer = require('printer');
const convertToPDF = require('pdf-puppeteer');
const path = require('path');

//console.log(printer.getPrinterDriverOptions());

const callback = pdf => {
  printer.printDirect({
    data: pdf, // or simple String: "some text"
    printer: 'Brother_MFC_J6930DW', // printer name, if missing then will print to default printer
    type: 'PDF', // type: RAW, TEXT, PDF, JPEG, .. depends on platform
    options: {
      PageRegion: 'Letter'
    },
    success: function(jobID) {
      console.log('sent to printer with ID: ' + jobID);
    },
    error: function(err) {
      console.log(err);
    }
  });
};

/* let html =
  '<html><body style="width: 8in; padding-left: 0.25in; padding-right: 0.25in;"><h1 style="color: #FF0000;">Testing testing</h1></body></html>';
 */
(async () => {
  const htmlPath = path.resolve(__dirname, 'printer.html');
  let html = await fs.readFileSync(htmlPath, { encoding: 'UTF8' });
  console.log(html);
})();

//convertToPDF(html, callback);

//console.log(printer.getPrinters());
return;
printer.printDirect({
  data: 'Testing the printer',
  printer: 'Brother_MFC_J6930DW', // printer name, if missing then will print to default printer
  type: 'TEXT', // type: RAW, TEXT, PDF, JPEG, .. depends on platform
  success: function(jobID) {
    console.log('sent to printer with ID: ' + jobID);
  },
  error: function(err) {
    console.log(err);
  }
});
