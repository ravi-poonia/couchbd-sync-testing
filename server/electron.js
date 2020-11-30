require('dotenv').config();
const log = require('electron-log');
const debug = require('electron-debug');
const electron = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs-extra');
const database = require('./database');
const { getStore } = require('./utils/Store');

const { getDatabase, imagesPath, dbPath } = database;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

debug();

let mainWindow;
const { app, BrowserWindow, protocol } = electron;

const store = getStore();

async function createWindow() {
  log.transports.file.level = 'info';

  // let { width, height } = store.get('windowBounds');
  let { width, height } = store.get('windowBounds');

  width = width < 100 ? 100 : width;
  height = height < 100 ? 100 : height;

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      webSecurity: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      plugins: true,
    },
  });

  mainWindow.loadURL(
    isDev ? 'http://localhost:3006' : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('uncaughtException', error => {
    console.log('-----> uncaughtException', error);
  });
}

app.on('ready', async function () {
  console.log(':: window ready');

  //Create Directory for Database and images
  await fs.ensureDir(dbPath);
  await fs.ensureDir(imagesPath);

  //Initialize Database
  await getDatabase(`${dbPath}/transportdb`);

  createWindow();
});

app.on('uncaughtException', error => {
  console.log('-----> uncaughtException', error);
});

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = request.url.replace('file:///', '');
    callback(pathname);
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log(':: window activate');
  if (mainWindow === null) {
    createWindow();
  }
});

function getWindowInstance() {
  return mainWindow;
}

exports.getWindowInstance = getWindowInstance;
