const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('node:path');
const { closePool, testConnection } = require('./db.cjs');
const { generateLatestOutlinePdf } = require('./outline.cjs');

const isDev = !app.isPackaged;

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = { ...details.requestHeaders };
    headers['Origin'] = 'http://localhost:5173';
    callback({ cancel: false, requestHeaders: headers });
  });
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 860,
    minHeight: 560,
    title: 'WTS',
    backgroundColor: '#f6f8fb',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    const devPort = process.env.DEV_PORT || 5173;
    mainWindow.loadURL(`http://127.0.0.1:${devPort}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-platform', () => process.platform);
  ipcMain.handle('db:test-connection', async () => {
    try {
      return await testConnection();
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  });
  ipcMain.handle('outline:generate-latest-pdf', async () => {
    try {
      return await generateLatestOutlinePdf();
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await closePool();
});
