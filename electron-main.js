const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'public/icon.png') // Optional: Ensure you have an icon
  });

  // In production, load the built file. In dev, load localhost.
  // Note: For the 'dist' script to work, we rely on building React first.
  const isDev = !app.isPackaged;

  if (isDev) {
    // If you run 'npm run dev' in another terminal, you can point electron to it
    // Or typically you just use 'npm run electron' which we set to run 'electron .'
    // For simplicity in this setup without concurrent, we assume production build mostly,
    // but let's try to load local vite server if available or fallback to file.
    win.loadURL('http://localhost:5173').catch(() => {
        win.loadFile(path.join(__dirname, 'dist/index.html'));
    });
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
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