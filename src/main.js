const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

require('update-electron-app')({// eslint-disable-line global-require
    repo: 'dogukancagatay/googletasks-desktop',
    updateInterval: '12 hour'
});

let mainWindow;
let appTray;

function createWindow() {

    mainWindow = new BrowserWindow({
        "width": 300,
        "height": 600,
        "x": screen.getPrimaryDisplay().workAreaSize.width - 300,
        "y": screen.getPrimaryDisplay().workAreaSize.height - 600,
        "icon": path.join(__dirname, "images", "icon.png"),
        "minWidth": 300,
        "minHeight": 300,
        "backgroundColor": "#50ffffff",
        "frame": false,       // Hide system menu
        "transparent": true,  // No app Background
        "skipTaskbar": true,  // Hidden on taskbar
        "webPreferences": {
            "nodeIntegration": true,  // Enable node integration
            "webviewTag": true,       // Enable webview tag
        },
    });

    mainWindow.loadURL(`file://${__dirname}/views/index.html`);

    mainWindow.on("closed", function () {
        mainWindow = null
    });

    if (!appTray) {
        initAppTray();
    }

}

function initAppTray() {
    appTray = new Tray(path.join(__dirname, "images", "trayiconTemplate.png"));
    appTray.setToolTip("Google Tasks");

    var contextMenu = Menu.buildFromTemplate([
        // {
        //     label: "Debug",
        //     click: function () {
        //         mainWindow.webContents.openDevTools({ mode: 'detach' })
        //     }
        // },
        {
            label: "Show",
            click: function () {
                if (mainWindow === null) {
                    createWindow()
                } else {
                    mainWindow.focus();
                    mainWindow.show();
                }
            }
        },
        {
            label: "Hide",
            click: function () {
                if (mainWindow && mainWindow.isVisible()) {
                    mainWindow.hide();
                }
            }
        },
        {
            label: "Logout",
            click: function () {
                mainWindow.webContents.send("view-load-url", "https://accounts.google.com/logout?&continue=https%3A%2F%2Fmail.google.com%2Ftasks%2Fig&followup=https%3A%2F%2Fmail.google.com%2Ftasks%2Fig#identifier");
            }
        },
        {
            label: "Close",
            click: function () {
                mainWindow.close();
            }
        }

    ]);

    appTray.on("click", function () {
        if (mainWindow === null) {
            createWindow();
        } else {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.focus();
                mainWindow.show();
            }
        }
    });

    if (process.platform === "darwin") {
        appTray.on("right-click", function () {
            appTray.popUpContextMenu(contextMenu);
        });
    } else {
        appTray.setContextMenu(contextMenu);
    }
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit()
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow()
    }
});

app.setAboutPanelOptions({
    credits: "All Google Tasks logos and the Google Tasks service are property of Google.",
    website: "https://github.com/dogukancagatay/googletasks-desktop",
});

ipcMain.on("close-main-window", function () {
    if (mainWindow) {
        mainWindow.hide();
    }
});
