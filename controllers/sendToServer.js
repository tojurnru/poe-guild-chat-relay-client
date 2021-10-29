const axios = require('axios');

const Config = require('../util/config');
const logger = require('../util/logger');
const pkg = require('../package.json')

const { URL, TOKEN } = Config.getConfig();

let sent = false;

module.exports = (eventEmitter) => {

  if (!URL) {
    const message = 'Empty URL. Going to ignore sending any data. Please set the file path in Settings page (right click taskbar icon -> Settings)';
    eventEmitter.emit('app-notify-error', message);
    return;
  }

  const axiosErrorHandler = (error) => {
    const { isAxiosError, code, config, response = {} } = error;
    if (!isAxiosError) throw error;

    const configStr = JSON.stringify(config, null, 2);
    const dataStr = JSON.stringify(response.data, null, 2);
    logger.error(`Axios Code: ${code}\nConfig:\n${configStr}\nData:\n${dataStr}`);

    if (!sent) {
      const message = `Unable to send message to server. Check logs and settings. (${code})`;
      eventEmitter.emit('app-notify-error', message);
      sent = true;
    }
  };

  const url = `${URL}/api/message`;
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'User-Agent': `tojurnru:poe-chat-relay-tool v${pkg.version}`
  };

  eventEmitter.on('app-send-to-server', async (lines) => {
    try {
      const response = await axios.post(url, lines, { headers });
      logger.debug(`response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      axiosErrorHandler(error);
    }
  });

};