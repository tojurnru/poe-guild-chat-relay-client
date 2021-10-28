const axios = require('axios');

const logger = require('../util/logger');

// const axiosErrorHandler = (error) => {
//   const { data = '' } = error.response;
//   logger.error(`Axios Response Data: ${JSON.stringify(data, null, 2)}`);
// };

const URL = `http://localhost:3000/api/message`;
const HEADERS = { 'User-Agent': 'tojurnru' };

module.exports = (eventEmitter) => {

  eventEmitter.on('app-send-to-server', async (lines) => {
    const response = await axios.post(URL, lines, { headers: HEADERS });
    logger.debug(`response: ${JSON.stringify(response.data)}`);
  });

};