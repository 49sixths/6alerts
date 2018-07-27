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
			var tipInfo;

			try {
				tipInfo = JSON.parse(message.data);
			} catch (e) {
				console.log('This doesn\'t look like a valid JSON: ', message.data);
				return;
			}
			// handle incoming message
			console.log('Websocket Message:', message.data);
			
			showTip(tipInfo);
		};

		socket.onclose = function() {
			console.log('CONNECTION LOST, retrying in 5 seconds');
			setTimeout(connect, 5000);
		}
	}

	let lastX = 0; // 0: left, 1: right
	const animationLayer = document.querySelector('.animation-layer');

	function showTip(tipInfo) {
		const tip = document.createElement('div');

		tip.classList.add('tip');
		tip.classList.add(tipInfo.main);
		tip.classList.add(tipInfo.move);
		tip.setAttribute('style', `animation-duration:${tipInfo.dur}s`);

		const wrapper = document.createElement('div');
		wrapper.classList.add('wrapper');
		tip.appendChild(wrapper);

		const img = document.createElement('div');
		img.classList.add('img');
		img.style.backgroundImage = `url(${tipInfo.graphic})`;
		wrapper.appendChild(img);

		const amt = document.createElement('div');
		amt.className = 'amount';
		amt.textContent = tipInfo.amount;
		wrapper.appendChild(amt);

		const usr = document.createElement('div');
		usr.className = 'username';
		usr.textContent = tipInfo.username;
		wrapper.appendChild(usr);
		
		if (lastX == 0) {
			tip.style.left = '5vw';
			tip.classList.add('left');
			lastX = 1;
		} else {
			tip.style.left = '80vw';
			tip.classList.add('right');
			lastX = 0;
		}
		
		animationLayer.appendChild(tip);

		setTimeout(function() {
			animationLayer.removeChild(tip);
		}, parseInt(tipInfo.dur) * 1000 + 1000);

		// Center img, usr and amt
		setTimeout(() => {
			// img.style.marginLeft = (-img.offsetWidth/2)+'px';
			// usr.style.marginLeft = (-usr.offsetWidth/2)+'px';
			// amt.style.marginLeft = (-amt.offsetWidth/2)+'px';
			
			// img.style.marginTop = (-img.offsetHeight/2)+'px';
			// usr.style.marginTop = (-usr.offsetHeight/2)+'px';
			// amt.style.marginTop = (-amt.offsetHeight/2)+'px';
		}, 50);
	}

	// setTimeout(function() { // REMOVE ME
	// 	const img = document.querySelector('img');
	// 	const usr = document.querySelector('.username');
	// 	const amt = document.querySelector('.amount')
		
	// 	img.style.marginLeft = (-img.offsetWidth/2)+'px';
	// 	usr.style.marginLeft = (-usr.offsetWidth/2)+'px';
	// 	amt.style.marginLeft = (-amt.offsetWidth/2)+'px';
		
	// 	img.style.marginTop = (-img.offsetHeight/2)+'px';
	// 	usr.style.marginTop = (-usr.offsetHeight/2)+'px';
	// 	amt.style.marginTop = (-amt.offsetHeight/2)+'px';
	// }, 0);

})();