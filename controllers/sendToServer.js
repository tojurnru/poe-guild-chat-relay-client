const axios = require('axios');
const { nanoid } = require('nanoid');

const Config = require('../util/config');
const logger = require('../util/logger');
const pkg = require('../package.json')

const { URL, GUILD_TAG } = Config.getConfig();

const url = `${URL}/api/message`;
const auth = {
  username: nanoid(),
  password: GUILD_TAG
};
const headers = {
  'User-Agent': `tojurnru:poe-chat-relay-tool v${pkg.version}`
};

module.exports = (eventEmitter) => {

  if (!URL) {
    const message = 'Empty URL. Please set URL in Settings page (right click taskbar icon -> Settings)';
    eventEmitter.emit('app-notify-error', message);
    return;
  }

  const axiosErrorHandler = (error) => {
    const { isAxiosError, code, config, response = {} } = error;
    if (!isAxiosError) throw error;

    const { data, status = 'N/A' } = response;

    const configStr = JSON.stringify(config, null, 2);
    const dataStr = JSON.stringify(data, null, 2);
    let errorMessage = `Axios Code: ${code}, HTTP: ${status}\n`;
    errorMessage += `Config: ${configStr}\n`;
    errorMessage += `Data: ${dataStr}`;
    logger.error(errorMessage);

    const message = `Can't connect to server. Check logs for more info. (Code: ${code}, HTTP: ${status})`;
    eventEmitter.emit('app-notify-warning', message);
    eventEmitter.emit('app-server-data', { status });
  };

  eventEmitter.on('app-send-to-server', async (lines) => {
    try {
      const response = await axios.post(url, lines, { auth, headers });
      logger.debug(`response: ${JSON.stringify(response.data)}`);
      eventEmitter.emit('app-server-data', response.data);
    } catch (error) {
      axiosErrorHandler(error);
    }
  });

};