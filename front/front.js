(function() {
	const electron = require('electron');

	document.addEventListener("DOMContentLoaded", function(event) {
		// Login
		const usernameInput = document.querySelector('.username');
		
		document.querySelector('.select-user').addEventListener('click', () => {
			userSelect(usernameInput.value);
		});

		usernameInput.addEventListener('keyup', (ev) => {
			if (ev.keyCode == 13) {
				userSelect(usernameInput.value);
			}
		})

		// Test tips
		const testUsername = document.querySelector('.test-username');
		const testAmount = document.querySelector('.test-amount');
		document.querySelector('.test-send').addEventListener('click', () => {
			electron.ipcRenderer.send('tip-alert', {
				username: testUsername.value,
				amount: testAmount.value,
				test: true
			});
		});
	});

	function userSelect(username) {
		console.log('LOGGING IN USER', username);
		document.querySelector('.login-form').style.display = 'none';
		document.querySelector('.logged-as').textContent = 'loading...';
		electron.ipcRenderer.send('select-username', username);
	}

	electron.ipcRenderer.on('login-success', function(event, username) {
		document.querySelector('.logged-as').textContent = `Waiting tips for ${username}`;
	});

	electron.ipcRenderer.on('new-tip', function(event, tipInfo) {
		const el = document.createElement('div');
		el.textContent = `${tipInfo.username} tipped ${tipInfo.amount}`;
		if (tipInfo.test == true) {
			el.style.color = '#999';
			el.textContent = el.textContent + ' (test)';
		}
		document.querySelector('.tip-history').appendChild(el);
	});

})();