const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wts', {
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  testDbConnection: () => ipcRenderer.invoke('db:test-connection'),
  generateLatestOutlinePdf: () => ipcRenderer.invoke('outline:generate-latest-pdf'),
});
