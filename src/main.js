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
const uniqid = require('uniqid');

let userSettings = {alerts:[], username:''};

exports.remoteLog = function(text) {
	console.log('FROM BROWSER: ', text);
}

// Create the main window
function createWindow () {
	mainWindow = new BrowserWindow({
		width: 700,
		height: 850,
		resizable: false,
		autoHideMenuBar: true,
		titleBarStyle:'hidden'
	});

	// Load main window content
	mainWindow.loadURL(url.format({ pathname: path.join(__dirname, "..", "front", "index.html"), protocol: "file:", slashes: true }));

	mainWindow.on('closed', () => {
		cbWindow = null;
		mainWindow = null;
		app.exit(0);
	});

	mainWindow.webContents.on('dom-ready', () => {
		// Load user data, if it exists
		const filePath = path.join(app.getPath('userData'), 'Settings.json');
		fs.readFile(filePath, (err, data) => {
			let settings;
			try {
				settings = JSON.parse(data);
			} catch(jsonErr) {
				settings = {alerts:[]};
			}
			mainWindow.webContents.send('loaded-settings', settings);
			userSettings = settings;
		});
	});
}

function selectAlert(amount) {
	if (typeof amount != 'number') amount = parseInt(amount);
	for (let i = 0; i < userSettings.alerts.length; i++) {
		const alert = userSettings.alerts[i];
		if (amount >= alert.min && amount <= alert.max) {
			return alert;
		}
	}
	return null;
}

ipcMain.on('tip-alert', (event, tipInfo) => {
	tipInfo.graphic = 'graphics/test1.gif';
	mainWindow.webContents.send('new-tip', tipInfo);

	const alertData = selectAlert(tipInfo.amount);
	
	if (alertData) {
		alertData.amount = tipInfo.amount;
		alertData.test = tipInfo.test;
		alertData.username = tipInfo.username;

		socketServer.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(alertData));
			}
		});
	} else {
		console.log('NO ALERT FOR TIP', tipInfo.amount, `OUT OF ${userSettings.alerts.length} ALERTS`);
	}
});

ipcMain.on('watch-status', (event, status) => {
	console.log('WATCH-STATUS', status);
	if (status == true) {
		mainWindow.webContents.send('login-success', broadcaster);
	}
});

ipcMain.on('toggle-chat-window', () => {
	console.log('toggle chat window', cbWindow.isVisible());
	if (cbWindow.isVisible()) {
		cbWindow.hide();
	} else {
		cbWindow.show();
	}
});

ipcMain.on('select-username', (event, username) => {
	broadcaster = username;
	cbWindow = new BrowserWindow({
		width: 1200,
		height: 600,
		x: 400,
		autoHideMenuBar: true,
		closable: false,
		show: false,
		webPreferences: {
			images: false,
			webaudio: false,
			webviewTag: false
		}
	});
	cbWindow.loadURL('https://chaturbate.com/' + username);

	// Emitted when the window is closed.
	cbWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		cbWindow = null;
	});

	cbWindow.webContents.on('dom-ready', () => {
		const injectedScript = fs.readFileSync(path.join(__dirname, 'cb-inject.js'), 'utf-8');
		cbWindow.webContents.executeJavaScript(injectedScript, true, function() {});
	});
});

ipcMain.on('user-not-found', (event, username) => {
	mainWindow.webContents.send('user-not-found');
});

ipcMain.on('user-offline', (event, username) => {
	mainWindow.webContents.send('user-offline');
});

ipcMain.on('toggle-devtools', (ev, arg) => {
	console.log(mainWindow.getBounds().width);
	if (mainWindow.getBounds().width < 1000) {
		mainWindow.setSize(1200, 850);
		mainWindow.openDevTools();
	} else {
		mainWindow.setSize(700, 850);
	}
});

ipcMain.on('updated-settings', (ev, data) => {
	const filePath = path.join(app.getPath('userData'), 'Settings.json');
	fs.writeFile(filePath, JSON.stringify(data), (err) => {
		console.log('Settings persisted');
	});
	userSettings = data;
});

ipcMain.on('image-selected', (ev, data) => {
	const pathInfo = path.parse(data.src);
	const dstDir = path.join(app.getPath('userData'), 'Alerts');
	
	if (fs.access(dstDir, (err)=> {
		fs.mkdir(dstDir, (err) => {
			const fileName = data.alertId + pathInfo.ext;
			const dstPath = path.join(app.getPath('userData'), 'Alerts', fileName);
			copyFile(data.src, dstPath, (err) => {
				if (!err) {
					mainWindow.webContents.send('image-saved', {
						alertId: data.alertId,
						fileName: fileName
					});
				}
			});
		});
	}));
});

function copyFile(source, target, cb) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}

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

anim.get('/graphic/:graphic', (req, res) => {
	const graphicPath = path.join(app.getPath('userData'), 'Alerts', req.params.graphic);
	res.sendFile(graphicPath);
});

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