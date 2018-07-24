// Settings //////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const obsPort = 3087;
const wsPort = 3088;

// Globals ///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

let mainWindow, cbWindow, broadcaster, socketServer, openSockets=[];

// Electron App //////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const url = require('url');
const path = require('path');
const electron = require('electron');
const fs = require('fs');
const {app, BrowserWindow, ipcMain} = require('electron');

exports.remoteLog = function(text) {
	console.log('FROM BROWSER: ', text);
}

// Create the main window
function createWindow () {
	mainWindow = new BrowserWindow({width: 1400, height: 800, show: true});

	// Load main window content
	mainWindow.loadURL(url.format({ pathname: path.join(__dirname, "..", "front", "index.html"), protocol: "file:", slashes: true }));
	// mainWindow.openDevTools();

	mainWindow.on('closed', () => {
		mainWindow = null;
		app.quit();
	});
}

ipcMain.on('tip-alert', function(event, tipInfo) {
	console.log('TIP RECEIVED:', tipInfo);
	tipInfo.graphic = 'graphics/test1.gif';
	mainWindow.webContents.send('new-tip', tipInfo);
	
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(tipInfo));
		}
	});
});

ipcMain.on('watch-status', function(event, status) {
	console.log('WATCH-STATUS', status);
	if (status == true) {
		mainWindow.webContents.send('login-success', broadcaster);
	}
});

ipcMain.on('select-username', function(event, username) {
	broadcaster = username;
	cbWindow = new BrowserWindow({width: 1400, height: 800, show: false});
	cbWindow.loadURL('https://chaturbate.com/' + username);
	cbWindow.openDevTools();

	// Emitted when the window is closed.
	cbWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		cbWindow = null;
	});

	cbWindow.webContents.on('dom-ready', function() {
		const injectedScript = fs.readFileSync(path.join(__dirname, 'cb-inject.js'), 'utf-8');
		cbWindow.webContents.executeJavaScript(injectedScript, true, function() {});
	});
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
})

// Animation Webserver ///////////////////////////////////////
//////////////////////////////////////////////////////////////

const express = require('express');
const anim = express();

anim.use(express.static('animation'));

anim.listen(obsPort, () => console.log(`OBS Browser Window: http://localhost:${obsPort}`));


// Animation Websocket ///////////////////////////////////////
//////////////////////////////////////////////////////////////

const WebSocket = require('ws');
socketServer = new WebSocket.Server({port:wsPort, clientTracking:true});

socketServer.on('connection', function connection(socket) {
	console.log('OBS CONNECTED');

	socket.on('close', (code, reason) => {
		console.log('OBS CONNECTION CLOSED');
	})
});