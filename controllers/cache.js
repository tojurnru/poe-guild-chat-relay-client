const logger = require('../util/logger');

const INTERVAL = 6000;

let lines = [];

module.exports = (eventEmitter) => {

  eventEmitter.on('app-cache', (line) => {
    lines.push(line);
  });

  const submitMessages = () => {
    eventEmitter.emit('app-send-to-server', lines);
    lines = [];

    setTimeout(submitMessages, INTERVAL);
  }

  submitMessages();
};