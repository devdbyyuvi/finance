require('dotenv').config();
const winston = require('winston');
const path = require('path');

const transports = [
  new winston.transports.Console()
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log')
    })
  );
}

const logger = winston.createLogger({
  transports
});
module.exports = logger
