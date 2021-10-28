'use strict';

const EventEmitter = require('events');

require('./controllers/config');
const Overlay = require('./controllers/overlay');
const ClientLog = require('./controllers/client-log');

async function start() {
  const eventEmitter = new EventEmitter();
  await Overlay(eventEmitter);
  ClientLog(eventEmitter);
}

start();