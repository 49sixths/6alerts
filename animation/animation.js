(function() {
	var socket;

	document.addEventListener("DOMContentLoaded", function(event) {
		connect();

		// Test tips
		// const testUsername = document.querySelector('.test-username');
		// const testAmount = document.querySelector('.test-amount');
		// document.querySelector('.test-send').addEventListener('click', () => {
		// 	showTip(testUsername.value, testAmount.value, 'graphics/test1.gif');
		// });
	});

	function connect() {
		// if user is running mozilla then use it's built-in WebSocket
		window.WebSocket = window.WebSocket || window.MozWebSocket;

		socket = new WebSocket('ws://localhost:3088');

		socket.onopen = function () {
			// connection is opened and ready to use
			console.log('CONNECTED');
		};

		socket.onerror = function (error) {
			// an error occurred when sending/receiving data
			console.log('CONNECTION ERROR');
		};

		socket.onmessage = function (message) {
			// try to decode json (I assume that each message
			// from server is json)
			var tipInfo;

			try {
				tipInfo = JSON.parse(message.data);
			} catch (e) {
				console.log('This doesn\'t look like a valid JSON: ', message.data);
				return;
			}
			// handle incoming message
			console.log('Websocket Message:', message.data);
			
			showTip(tipInfo.username, tipInfo.amount, tipInfo.graphic);
		};

		socket.onclose = function() {
			console.log('CONNECTION LOST, retrying in 5 seconds');
			setTimeout(connect, 5000);
		}
	}

	function showTip(username, amount, graphic) {
		const tip = document.createElement('div');
		tip.className = 'tip';

		const img = document.createElement('img');
		img.src = graphic;
		tip.appendChild(img);

		const amt = document.createElement('div');
		amt.className = 'amount';
		amt.textContent = amount;
		tip.appendChild(amt);

		const usr = document.createElement('div');
		usr.className = 'username';
		usr.textContent = username;
		tip.appendChild(usr);

		document.body.appendChild(tip);

		setTimeout(function() {
			document.body.removeChild(tip);
		}, 5000);
	}
})();