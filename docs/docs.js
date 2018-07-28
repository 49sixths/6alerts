(function() {
	Number.prototype.between = function(min, max) {
		return this >= min && this <= max;
	}

	var canvas = document.querySelector('.sprite-canvas');

	for (var i = 0; i < 50; i++) {
		var initialY = Math.floor(Math.random() * Math.floor(canvas.offsetHeight) + 1);
		spawnSprite(initialY, 0);
	}

	function spawnSprite(initialY) {
		var number = Math.floor(Math.random() * Math.floor(100) + 1);
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
			sprite.style.fontSize = '16px';
		} else if (number.between(26, 75)) {
			sprite.style.color = 'rgba(255, 255, 255, 0.2)';
			sprite.style.transitionDuration = (5-speedFactor*5)+'s'
			sprite.style.fontSize = '22px';
		} else if (number.between(76, 100)) {
			sprite.style.color = 'rgba(255, 255, 255, 0.3)';
			sprite.style.transitionDuration = (8-speedFactor*8)+'s'
			sprite.style.fontSize = '28px';
		}

		canvas.appendChild(sprite);
		setTimeout(function() {
			sprite.style.transform = 'translateY('+canvas.offsetHeight+'px)';
		}, 10);
	}
})();