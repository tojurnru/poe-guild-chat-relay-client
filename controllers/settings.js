const { BrowserWindow, app, nativeImage, ipcMain } = require('electron');
const Config = require('../util/config');

let window;
const serverInfo = {
  code: '',
  status: 0,
  clients: 0,
  received: 0
};

/**
 * Functions
 */

const createWindow = () => {

  if (window) {
    try {
      window.focus();
    } catch {
      window = undefined;
      createWindow();
    }
    return;
  }

  window = new BrowserWindow({
    width: 600,
    height: 460,
    // icon: nativeImage.createFromPath('./images/icon-20x16.png'),
    fullscreenable: false,
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  window.loadFile('./views/settings.html');

  if (process.env.NODE_ENV === 'development') {
    window.webContents.openDevTools({ mode: 'detach', activate: false })
  }

  window.once('ready-to-show', () => {
    const config = Config.getConfig();
    config.productName = app.getName();

    window.webContents.send('web-settings', config);
    window.webContents.send('web-server-info', serverInfo);

    window.show();
  });
};

const closeWindow = () => {
  if (window) {
    window.close();
    window = undefined;
  }
};

const init = async (eventEmitter) => {

  ipcMain.on('web-settings-close', (event, quit, config) => {
    if (config) {
      Config.setConfig(config);
    }

    if (quit) {
      app.quit();
    } else {
      closeWindow();
    }
  });

  eventEmitter.on('app-server-response', (responseData) => {
    const { status, code = '', clients = 0, received = 0 } = responseData;
    serverInfo.status = status;
    serverInfo.code = code;
    serverInfo.clients = clients;
    serverInfo.received += received;

    if (window) {
      window.webContents.send('web-server-info', serverInfo);
    }
  });
};

module.exports = {
  init,
  createWindow
};