const winston = require('winston');
const date = new Date();
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: `logs/full_log_${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}.log`
    })
  ]
});

module.exports = logger;
