const nodemailer = require('nodemailer');
const fs = require('fs');

const address = process.env.SMTP_ADDRESS;
const port = parseInt(process.env.SMTP_PORT);
const user = process.env.SMTP_USER;
const password = process.env.SMTP_PASSWORD;
const email = process.env.LOG_RECIPIENT_EMAIL;

let date = new Date();
// Set date to day before
date = new Date(date - 1000 * 60 * 60 * 24);
const logName = `full_log_${date.getFullYear()}-${date.getMonth() +
  1}-${date.getDate()}.log`;

(async () => {
  let log = await fs.readFileSync(`./logs/${logName}`, 'utf8');
  log = log
    .replace(/}/gi, '},')
    .replace(/level:/gi, "'level':")
    .replace(/message:/gi, "'message':")
    .replace(/timestamp:/gi, "'timestamp':")
    .replace(/'/gi, '"');
  log = log.slice(0, log.length - 2);
  log = '[' + log + ']';
  log = JSON.parse(log);
  //console.log(JSON.parse(log));
  //console.log(log);

  let htmlBody =
    '<table><tr><th colspan="2">Amazon/Lightspeed sync logs for ' +
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` +
    '</th></tr>';

  log.forEach((logObject, index) => {
    if (logObject.level === 'info') {
      htmlBody += '<tr style="background: #33cc33">';
    } else if (logObject.level === 'warn') {
      htmlBody += '<tr style="background: #cccc00">';
    } else {
      htmlBody += '<tr style="background: #cc0000">';
    }

    htmlBody += `<td>${logObject.message}</td>`;
    htmlBody += `<td>${logObject.timestamp}</td>`;
    htmlBody += '</tr>';
  });

  htmlBody += '</table>';

  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: address,
    port: 587,
    secure: false,
    auth: {
      user: user,
      pass: password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let info = await transporter.sendMail({
    from: `"Sync Logs" <${user}>`, // sender address
    to: email, // list of receivers
    subject:
      'TESTING ' +
      'Amazon/Lightspeed sync logs for ' +
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, // Subject line
    text: JSON.stringify(log), // plain text body
    html: htmlBody // html body
  });

  //console.log('Message sent: %s', info);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
})();
