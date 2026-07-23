const { app, BrowserWindow } = require('electron');
const path = require('path');

// Set environment variables for production
process.env.NODE_ENV = 'production';
process.env.PORT = '3001';

// Start the Express backend server
try {
  require('../backend/dist/index.js');
} catch (err) {
  console.error('Erreur lors du démarrage du serveur Express:', err);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SOS Villages d'Enfants - Gestion des Numéros",
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();
  win.setMenuBarVisibility(false);

  // Load the backend server URL (which serves React app)
  win.loadURL('http://localhost:3001');

  // Handle crash or reload attempts
  win.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      win.loadURL('http://localhost:3001');
    }, 1000);
  });
}

app.whenReady().then(() => {
  // Wait a small delay to make sure Express started
  setTimeout(createWindow, 500);

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
