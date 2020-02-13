const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const date = new Date();
const logger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss A'
    }),
    prettyPrint()
  ),
  transports: [
    new transports.File({
      filename: `logs/full_log_${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}.log`
    })
  ]
});

module.exports = logger;
