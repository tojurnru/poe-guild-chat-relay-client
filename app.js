const EventEmitter = require('events');

require('./controllers/config');

const Overlay = require('./controllers/overlay');
const SendToServer = require('./controllers/sendToServer');
const Cache = require('./controllers/cache');
const ClientLog = require('./controllers/client-log');

async function start() {
  const eventEmitter = new EventEmitter();

  await Overlay(eventEmitter);
  SendToServer(eventEmitter);
  Cache(eventEmitter);
  ClientLog(eventEmitter);

}

start();