'use strict';

const pkg = require('../package.json')
const winston = require('winston');
const { printf, combine, timestamp } = winston.format;

const formatter = printf(({ level, message, timestamp }) => {
  return `${timestamp} | ${level} | ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), formatter),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: `${pkg.name}.log` })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

module.exports = logger;
