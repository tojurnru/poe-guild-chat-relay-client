const path = require('path');
const { app, shell, globalShortcut, ipcMain, BrowserWindow, Tray, nativeImage, Menu } = require('electron');
const { overlayWindow } = require('electron-overlay-window');

const { createWindow: createSettingsWindow } = require('./settings');
const { POE_WINDOW_TITLE } = require('../util/config').getConfig();
const logger = require('../util/logger');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (eventEmitter) => {

  /**
   * Window Setup
   */

  let window, tray;

  async function createWindow() {
    window = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      ...overlayWindow.WINDOW_OPTS
    });

    await window.loadFile('./views/overlay.html');

    window.setIgnoreMouseEvents(true, { forward: true });

    if (process.env.NODE_ENV === 'development') {
      setDevelopmentKeyBindings();
      window.webContents.openDevTools({ mode: 'detach', activate: false })
    }

    overlayWindow.attachTo(window, POE_WINDOW_TITLE);
  }

  function setDevelopmentKeyBindings () {

    globalShortcut.register('CmdOrCtrl + H', () => {
      const type = 'error';
      const title = app.getName();
      const message = `(Demo) ${new Date().getTime()}`;

      window.webContents.send('web-notify', { type, title, message });

      logger.debug(`web-notify (${type}) ${message}`);
    });

    globalShortcut.register('CmdOrCtrl + J', () => {
      window.webContents.send('web-toggle');
    });

  }

  /**
   * Tray Setup
   */

  async function createTray() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '../images/icon-50.png')));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `${app.getName()} v${app.getVersion()}`,
        // enabled: false,
        icon: nativeImage.createFromPath(path.join(__dirname, '../images/icon-20.png')),
        click: () => {
          shell.openExternal('https://github.com/tojurnru/poe-chat-relay-tool/releases');
        }
      },
      { type: 'separator' },
      {
        label: `Settings`,
        click: () => {
          createSettingsWindow();
        }
      },
      /*
      {
        label: 'Check for Update',
        click: () => {
          shell.openExternal('https://github.com/tojurnru/poe-chat-relay-tool/releases');
        }
      },
      */
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => { app.quit(); }
      }
    ]);

    tray.on('double-click', () => { createSettingsWindow(); })
    tray.setToolTip(app.getName());
    tray.setContextMenu(contextMenu);
  }

  /**
   * Event Setup
   */

  eventEmitter.on('app-notify-success', (message) => {
    const type = 'success';
    const title = app.getName();

    window.webContents.send('web-notify', { type, title, message });

    logger.debug(`web-notify (${type}) ${message}`);
  });

  eventEmitter.on('app-notify-error', (message) => {
    const type = 'warning';
    const title = app.getName();

    window.webContents.send('web-notify', {
      type, title, message,
      options: { timeOut: 0, extendedTimeOut: 0 }
    });

    logger.debug(`web-notify (${type}) ${message}`);
  });

  /*
  eventEmitter.on('app-notify-chat', (line) => {
    // const type = 'error';
    const type = 'success';
    const title = app.getName();

    window.webContents.send('web-notify', { type, title, message: line });

    logger.debug(`web-notify (${type}) ${line}`);
  });
  */

  ipcMain.on('web-mouse', (event, isMouseEnter) => {
    if (isMouseEnter) {
      window.setIgnoreMouseEvents(false);
      overlayWindow.activateOverlay();
    } else {
      window.setIgnoreMouseEvents(true, { forward: true });
      overlayWindow.focusTarget();
    }
  });

  /**
   * App Setup
   */

  app.disableHardwareAcceleration(); // https://github.com/electron/electron/issues/25153

  app.on('ready', () => {
    createTray();
  });

  app.on('activate', () => {
    // https://www.electronjs.org/docs/tutorial/quick-start#open-a-window-if-none-are-open-macos
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  /*
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  */

  await app.whenReady();

  // https://github.com/electron/electron/issues/16809
  await timeout(process.platform === 'linux' ? 1000 : 0);

  await createWindow();
};