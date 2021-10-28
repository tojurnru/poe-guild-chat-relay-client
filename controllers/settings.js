const { BrowserWindow, app, nativeImage, ipcMain } = require('electron');
const Config = require('../util/config');

let window;

function createWindow() {

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
    height: 300,
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

    window.show();
  });
}

function closeWindow() {
  if (window) {
    window.close();
    window = undefined;
  }
}

/**
 * Event Setup
 */

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

module.exports = {
  createWindow,
  closeWindow
};
