(function() {
	const path = require('path');
	const fs = require('fs');
	const {ipcRenderer} = require('electron');
	const uniqid = require('uniqid');

	document.addEventListener("DOMContentLoaded", function(event) {
		// User Connect
		const usernameInput = document.querySelector('.username');
		
		document.querySelector('.login-button').addEventListener('click', () => {
			connectUser(usernameInput.value);
		});

		usernameInput.addEventListener('keyup', (ev) => {
			if (ev.keyCode == 13) {
				connectUser(usernameInput.value);
			}
		})

		// Test tips
		const testUsername = document.querySelector('.test-username');
		const testAmount = document.querySelector('.test-amount');
		document.querySelector('.test-send').addEventListener('click', () => {
			ipcRenderer.send('tip-alert', {
				username: testUsername.value,
				amount: testAmount.value,
				test: true
			});
		});

		// sendTestTip();
		function sendTestTip() {
			if (document.querySelectorAll('.alert').length > 0) {
				const inputs = document.querySelectorAll('[name=min]');
				const min = parseInt(inputs[0].value);
				const max = parseInt(inputs[inputs.length-1].value);
				const randomTip = Math.floor(Math.random() * (max - min + 1)) + min;
				
				ipcRenderer.send('tip-alert', {
					username: testUsername.value,
					amount: randomTip,
					test: true
				});
			} else {
				ipcRenderer.send('tip-alert', {
					username: testUsername.value,
					amount: testAmount.value,
					test: true
				});
			}
			setTimeout(sendTestTip, 2000);
		}

		// Fill test
		// for (let i = 0; i < 40; i++) {
		// 	ipcRenderer.send('tip-alert', {
		// 		username: testUsername.value,
		// 		amount: testAmount.value,
		// 		test: true
		// 	});
		// }
	});

	function connectUser(username) {
		console.log('LOGGING IN USER', username);
		document.querySelector('.broadcaster-login').style.display = 'none';
		document.querySelector('.broadcaster-info').style.display = 'block';
		document.querySelector('.broadcaster-username').textContent = 'loading...';
		ipcRenderer.send('select-username', username);
		serializeSettings();
	}

	ipcRenderer.on('login-success', function(event, username) {
		document.querySelector('.broadcaster-username').textContent = `Waiting tips for ${username}`;
	});

	// Received a tip
	ipcRenderer.on('new-tip', function(event, tipInfo) {
		var noTips = document.querySelector('.no-tips');
		if (noTips) {
			noTips.parentElement.removeChild(noTips);
		}

		const el = document.createElement('div');
		el.classList.add('tip-item');
		el.textContent = `${tipInfo.username} tipped ${tipInfo.amount}`;
		if (tipInfo.test == true) {
			el.style.color = '#999';
			el.textContent = el.textContent + ' (test)';
		}
		const tipHistory = document.querySelector('.tip-history');
		tipHistory.appendChild(el);
		tipHistory.scrollTop = tipHistory.scrollHeight;

		incrementCounter();
	});

	// Tabs
	document.querySelector('.tabs').addEventListener('click', (ev) => {
		if (ev.target.dataset.pane) {

			const targetPane = document.querySelector('.pane.'+ev.target.dataset.pane);

			const panes = document.querySelectorAll('.pane');
			for (let i = 0 ; i < panes.length; i++) {
				panes[i].classList.remove('selected');
			}
			targetPane.classList.add('selected');

			const tabs = document.querySelectorAll('.tabs a');
			for (let i = 0; i < tabs.length; i++) {
				tabs[i].classList.remove('selected');
			}
			ev.target.classList.add('selected');

			resetCounter();
		}
	});

	function resetCounter() {
		const counter = document.querySelector('.tabs a .counter');
		if (document.querySelector('.tabs a[data-pane=tips-pane]').classList.contains('selected')) {
			counter.classList.remove('show');
			counter.textContent = '0';
		}
	}

	function incrementCounter() {
		const counter = document.querySelector('.tabs a .counter');
		if (!document.querySelector('.tabs a[data-pane=tips-pane]').classList.contains('selected')) {
			counter.textContent = parseInt(counter.textContent) + 1;

			if (!counter.classList.contains('show')) {
				counter.classList.add('show');
			}
		}
	}

	// Toggle Chaturbate window
	document.querySelector('.toggle-chat-window').addEventListener('click', () => {
		ipcRenderer.send('toggle-chat-window', true);
	});

	// Add Alert
	document.querySelector('.add-alert-button').addEventListener('click', function() {
		const lastAlert = document.querySelector('.alert:last-child');
		const newMin = lastAlert ? parseInt(lastAlert.querySelector('[name=max]').value) + 1 : 1;
		renderAlert(uniqid(), newMin, newMin+10, '', 'shake', 'arch', 1);
		serializeSettings();
	});

	// Remove alert
	document.querySelector('.alert-list').addEventListener('click', (ev) => {
		if (ev.target.classList.contains('alert-remove-button')) {
			const alert = ev.target.closest('.alert');
			alert.parentElement.removeChild(alert);
			serializeSettings();
			if (document.querySelectorAll('.alert').length == 0) {
				document.querySelector('.no-alerts').style.display = 'block';
			}
		}
	});
	
	// Render alerts
	const alertTemplate = document.getElementById('alert-template');
	function renderAlert(id, min, max, graphic, main, move, dur) {
		const clone = document.importNode(alertTemplate.content, true);
		clone.querySelector('.alert').id = `alert-${id}`;
		clone.querySelector('[name=id]').value = id;
		clone.querySelector('[name=min]').value = min;
		clone.querySelector('[name=max]').value = max;
		clone.querySelector('[name=graphic]').value = graphic;
		clone.querySelector('[name=main]').value = main;
		clone.querySelector('[name=move]').value = move;
		clone.querySelector('[name=dur]').value = dur;
		clone.querySelector('.image-placeholder').style.backgroundImage = `url(${graphic})`;
		document.querySelector('.alert-list').appendChild(clone);
		document.querySelector('.no-alerts').style.display = 'none';
	}

	// Image selection
	document.querySelector('.alert-list').addEventListener('change', (ev) => {
		if (ev.target.classList.contains('file-input')) {
			const input = ev.target;
			if (input.files.length > 0) {
				const alertId = ev.target.closest('.alert').querySelector('[name=id]').value;
				ipcRenderer.send('image-selected', {
					alertId: alertId,
					src: input.files[0].path
				});
			}
		}
	});

	ipcRenderer.on('image-saved', (ev, data) => {
		const placeholder = document.getElementById('alert-'+data.alertId).querySelector('.image-placeholder');
		const imgUrl = `http://localhost:3087/graphic/${data.fileName}`;
		placeholder.style.backgroundImage = `url(${imgUrl})`;
		placeholder.querySelector('input[name=graphic]').value = imgUrl;
	});

	function replaceAll(str, find, replace) {
		return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
	};

	// Toggle devTools
	document.querySelector('.toggle-devtools').addEventListener('click', (ev) => {
		ipcRenderer.send('toggle-devtools', true);
	});

	// Settings serialization
	document.querySelector('.alert-list').addEventListener('change', (ev) => {
		serializeSettings();
	});
	
	let debounceTimer = null;
	function serializeSettings() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			console.log('Saving user settings');
			let settings = {alerts:[], username:document.querySelector('.username').value};
			document.querySelectorAll('.alert').forEach((alert, index) => {
				var item = {};
				alert.querySelectorAll('input:not([type=file]), select').forEach((input, index) => {
					item[input.name] = input.value;
				});
				settings.alerts.push(item);
			});
			ipcRenderer.send('updated-settings', settings);
		}, 500);
	}

	// Deserialize user settings
	ipcRenderer.on('loaded-settings', (ev, settings) => {
		document.querySelector('.add-alert-button').removeAttribute('disabled');
		if (settings.username) {
			document.querySelector('input[name=username]').value = settings.username;
		}
		settings.alerts.forEach((a) => {
			renderAlert(a.id, a.min, a.max, a.graphic, a.main, a.move, a.dur);
		});
	})

	ipcRenderer.on('user-not-found', (ev, arg) => {
		connectionError('USER NOT FOUND');
	});

	ipcRenderer.on('user-offline', (ev, arg) => {
		connectionError('USER OFFLINE');
	});

	function connectionError(motive) {
		document.querySelector('.broadcaster-login').style.display = 'block';
		document.querySelector('.broadcaster-info').style.display = 'none';
		displayError(motive);
	}

	const errorPane = document.querySelector('.error');
	function displayError(errorMsg) {
		errorPane.textContent = errorMsg;
		errorPane.style.height = '50px';
		setTimeout(function() {
			errorPane.style.height = '0px';
		}, 3000);
	}

})();