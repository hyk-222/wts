const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('node:path');
const { closePool, testConnection } = require('./db.cjs');
const { generateLatestOutlinePdf } = require('./outline.cjs');

const isDev = !app.isPackaged;

const http = require('http');
const fs = require('fs');

let server = null;

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
    // 在打包后启动一个本地 HTTP 服务器来提供静态文件
    const distPath = path.join(__dirname, '../dist');
    server = http.createServer((req, res) => {
      let filePath = req.url === '/' ? '/index.html' : req.url;
      let fullPath = path.join(distPath, filePath);
      
      const ext = path.extname(fullPath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg') contentType = 'image/jpeg';
      
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
    
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      mainWindow.loadURL(`http://127.0.0.1:${addr.port}`);
    });
  }
}

app.whenReady().then(() => {
  // 设置请求头，解决跨域问题
  const apiHost = isDev ? 'localhost:8080' : 'wts.weichai.com';
  const apiPath = isDev ? '' : '/stage-api';
  const localOrigin = 'http://localhost:5173';
  
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = { ...details.requestHeaders };
    headers['Origin'] = localOrigin;
    headers['Referer'] = localOrigin + '/';
    if (!isDev) {
      headers['Host'] = apiHost;
    }
    callback({ cancel: false, requestHeaders: headers });
  });

  // 允许所有来源的 CORS
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': [localOrigin],
        'Access-Control-Allow-Credentials': ['true'],
        'Access-Control-Allow-Headers': ['Content-Type', 'Authorization', 'X-Requested-With', 'token'],
        'Access-Control-Allow-Methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      }
    });
  });

  // 允许所有 Cookie，解决 file:// 协议下的 Cookie 问题
  session.defaultSession.cookies.set({
    url: `http://${apiHost}`,
    name: 'allow-all-cookies',
    value: 'true',
    httpOnly: false,
    secure: false,
    sameSite: 'no_restriction'
  }).catch(() => {});

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
  if (server) {
    server.close();
  }
  await closePool();
});
