const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, prettyPrint } = format;

const transport = new transports.DailyRotateFile({
  filename: `logs/full_log_%DATE%.log`,
  datePattern: 'YYYY-MM-DD'
});

const date = new Date();
const logger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss A'
    }),
    prettyPrint()
  ),
  transports: [transport]
});

module.exports = logger;
