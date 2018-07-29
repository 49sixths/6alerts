(function() {
	Number.prototype.between = function(min, max) {
		return this >= min && this <= max;
	}

	var canvas = document.querySelector('.sprite-canvas');

	for (var i = 0; i < 50; i++) {
		var initialY = Math.floor(Math.random() * Math.floor(canvas.offsetHeight)) + 1;
		spawnSprite(initialY, 0);
	}

	function spawnSprite(initialY) {
		var number = Math.floor(Math.random() * Math.floor(100)) + 1;
		var sprite = document.createElement('div');
		sprite.classList.add('sprite');
		sprite.classList.add('sprite-small');
		sprite.textContent = number;

		sprite.style.setProperty('left', Math.floor(Math.random() * Math.floor(100)) + 'vw');
		
		if (initialY == 0) {
			sprite.style.transform = 'translateY(-100%)';
		} else {
			sprite.style.transform = 'translateY('+initialY+'px)';
		}
		sprite.style.transitionProperty = 'transform';
		
		sprite.addEventListener('transitionend', function(ev) {
			canvas.removeChild(sprite);
			spawnSprite(0);
		});
		
		var speedFactor = initialY/canvas.offsetHeight;
		if (number.between(1, 25)) {
			sprite.style.color = 'rgba(255, 255, 255, 0.1)';
			sprite.style.transitionDuration = (3-speedFactor*3)+'s';
			sprite.style.fontSize = '18px';
		} else if (number.between(26, 75)) {
			sprite.style.color = 'rgba(255, 255, 255, 0.15)';
			sprite.style.transitionDuration = (5-speedFactor*5)+'s'
			sprite.style.fontSize = '24px';
		} else if (number.between(76, 100)) {
			sprite.style.color = 'rgba(255, 255, 255, 0.2)';
			sprite.style.transitionDuration = (8-speedFactor*8)+'s'
			sprite.style.fontSize = '32px';
		}

		canvas.appendChild(sprite);
		setTimeout(function() {
			sprite.style.transform = 'translateY('+canvas.offsetHeight+'px)';
		}, 10);
	}

	// Chat content

	var usernames = [
		'someguy', 'john52', 'sixths', 'vladimir', 'steve',
		'tom', 'rusty', 'slinky', 'jack21', 'stewart', 'big_boy34',
		'so_edgy666', 'funnyman', 'funklord', 'wiseguy', 'timmy'
	];
	var messages = [
		'hi',
		'wow!',
		'so hot!',
		'watch my cam bb',
		'oh yeah',
		'how can I unsubscribe from Creative Cloud?!',
		'I will give you 1000 tokens if you lick your elbow',
		'my wife caught me watching this!',
		'it\'s "you\'re" not "your"',
		'it\'s "your" not "youre"',
		'watch out, the grammar police is here!',
		'damn!',
		'oh wow',
		'marry me!',
		'pm plz',
		'lower the music I cant hear you!',
		'boobs',
		'lol',
		'рш',
		'привет',
		'hola',
		'hahaha',
		'knock knock',
		'open bob pls',
		'can i send u noods',
		'soles pls'
	];
	var colors = ['grey', 'lightblue', 'darkblue', 'lightpurple', 'darkpurple'];

	var chatList = document.querySelector('.chat-list');

	for (var i = 0; i < 10; i++) {
		randomChatMessage(false);
	}

	function sendNewMessage() {
		randomChatMessage(Math.random() > 0.8);
		var timeout = Math.floor(Math.random() * Math.floor(2000));
		setTimeout(sendNewMessage, timeout);
	}
	sendNewMessage();

	function randomChatMessage(isTip) {
		var nameIndex = Math.floor(Math.random() * Math.floor(usernames.length));
		var colorIndex = Math.floor(Math.random() * Math.floor(colors.length));

		var wrapper = document.createElement('div');
		var chatMsg = document.createElement('span');
		wrapper.appendChild(chatMsg);

		var usr = document.createElement('span');
		usr.textContent = usernames[nameIndex] + ':';
		usr.classList.add('usr');
		usr.classList.add(colors[colorIndex]);
		chatMsg.appendChild(usr);

		if (isTip) {
			chatMsg.classList.add('tip');
			var tipAmount = Math.floor(Math.random() * Math.floor(100)) + 1;
			var tipMsg = ' tipped '+tipAmount+' tokens';
			chatMsg.appendChild(document.createTextNode(tipMsg));
			renderAlert(usernames[nameIndex], tipAmount);
		} else {
			var msgIndex = Math.floor(Math.random() * Math.floor(messages.length));
			chatMsg.appendChild(document.createTextNode(messages[msgIndex]));
		}

		chatList.appendChild(wrapper);

		if (chatList.childNodes.length > 23) {
			chatList.removeChild(chatList.childNodes[0]);
		}
	}
	
	var alertSide = 0; //0:left, 1:right
	var alertCanvas = document.querySelector('.tip-alert-canvas');
	function renderAlert(usr, amount) {
		var alert = document.createElement('div');
		alert.classList.add('tip-alert');
		
		var alertImg = document.createElement('div');
		alertImg.classList.add('alert-graphic');
		alert.appendChild(alertImg);
		
		var alertAmt = document.createElement('div');
		alertAmt.classList.add('alert-amount');
		alertAmt.textContent = amount;
		alert.appendChild(alertAmt);
		
		var alertUsr = document.createElement('div');
		alertUsr.classList.add('alert-username');
		alertUsr.textContent = usr;
		alert.appendChild(alertUsr);

		if (alertSide == 0) {
			alert.style.left = '10%';
			alertSide = 1;
		} else {
			alert.style.left = '75%';
			alertSide = 0;
		}

		alertCanvas.appendChild(alert);

		alert.addEventListener('animationend', function() {
			alertCanvas.removeChild(alert);
		});
	}

	document.querySelector('.send-tip').addEventListener('click', sendTip)
	function sendTip() {
		randomChatMessage(true);
	}

})();