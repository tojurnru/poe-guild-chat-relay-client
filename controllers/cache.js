const logger = require('../util/logger');

const INTERVAL = 3000;

module.exports = (eventEmitter) => {

  let lines = [];

  eventEmitter.on('app-cache', (line) => {
    lines.push(line);
  });

  const process = () => {
    logger.debug(`Process Data: ${lines.length}`);
    eventEmitter.emit('app-send-to-server', lines);
    lines = [];

    setTimeout(process, INTERVAL);
  }

  setTimeout(process, INTERVAL);
};