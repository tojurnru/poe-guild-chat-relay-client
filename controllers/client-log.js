'use strict';

const sane = require('sane');
const fs = require('fs');
const readline = require('readline');

const Config = require('../util/config');
const logger = require('../util/logger');

let { CLIENTTXT_PATH } = Config.getConfig();

const COMMON_PATH = [
  'C:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt',
  'D:/Program Files (x86)/Grinding Gear Games/Path of Exile/logs/Client.txt',
  'C:/Program Files (x86)/Steam/steamapps/common/Path of Exile/logs/Client.txt',
  'D:/Program Files (x86)/Steam/steamapps/common/Path of Exile/logs/Client.txt'
];

module.exports = (eventEmitter) => {

  /**
   * Client.txt Setup
   */

  if (!fs.existsSync(CLIENTTXT_PATH)) {

    for (const path of COMMON_PATH) {
      if (fs.existsSync(path)) {
        CLIENTTXT_PATH = path;
        break;
      }
    }

    if (!CLIENTTXT_PATH) {
      const message = 'Unable to find Client.txt. Please set the file path in Settings page (right click taskbar icon -> Settings)';
      eventEmitter.emit('app-notify-error', message);
      return;
    }

    Config.setConfig({ CLIENTTXT_PATH });
  }

  /**
   * File Watcher Setup
   */

  function splitFilePath(path) {
    const data = path.replaceAll('\\', '/');
    const idx = data.lastIndexOf('/');

    if (idx < 0) {
      return [ '', path ];
    }

    const dir = path.substr(0, idx);
    const file = path.substr(idx + 1);

    return [ dir, file ];
  }

  let index = fs.statSync(CLIENTTXT_PATH).size;

  const [ dir, file ] = splitFilePath(CLIENTTXT_PATH);

  sane(dir, { glob: file })
    .on('ready', () => {
      const message = `Listening to: ${CLIENTTXT_PATH}`;
      eventEmitter.emit('app-notify-success', message);
    })
    .on('change', (filepath, root, stat) => {

      const options = {
        encoding: 'utf-8',
        start: index
      };

      index = stat.size;

      readline
        .createInterface({
          input: fs.createReadStream(CLIENTTXT_PATH, options)
        })
        .on('line', (line) => {
          logger.silly(`CLIENT.TXT ${line}`);

          if (line.includes('&<KotRT>')) {
            logger.debug(line);
            eventEmitter.emit('app-notify-chat', line);
          }
        });
    });

};