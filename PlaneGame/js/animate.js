function animate() {
		// Clear
		context.clearRect(0, 0, canvasWidth, canvasHeight);	
		
		// Loop through every asteroid
		var asteroidsLength = asteroids.length;
		for (var i = 0; i < asteroidsLength; i++) {
			var tmpAsteroid = asteroids[i];
			
			// Calculate new position
			tmpAsteroid.x += tmpAsteroid.vX;
			
			// Check to see if you need to reset the asteroid
			if (tmpAsteroid.x+tmpAsteroid.radius < 0) {
				tmpAsteroid.radius = 5+(Math.random()*10);
				tmpAsteroid.x = canvasWidth+tmpAsteroid.radius;
				tmpAsteroid.y = Math.floor(Math.random()*canvasHeight);
				tmpAsteroid.vX = -5-(Math.random()*5);
			};
			
			// Player to asteroid collision detection
			var dX = player.x - tmpAsteroid.x;
			var dY = player.y - tmpAsteroid.y;
			var distance = Math.sqrt((dX*dX)+(dY*dY));
			
			if (distance < player.halfWidth+tmpAsteroid.radius) {
				// Stop thrust sound
				soundThrust.pause();
				
				// Play death sound
				soundDeath.currentTime = 0;
				soundDeath.play();
			
				// Game over				
				playGame = false;
				clearTimeout(scoreTimeout);
				uiStats.hide();
				uiComplete.show();
				
				// Reset sounds
				soundBackground.pause();
		
				// Reset event handlers
				$(window).unbind("keyup");
				$(window).unbind("keydown");
			};
		
			context.fillStyle = "rgb(255, 255, 255)";
			context.beginPath();
			context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
			context.closePath();
			context.fill();
		};
		
		// Update player
		player.vX = 0;
		player.vY = 0;
		
		if (player.moveRight) {
			player.vX = 3;
		} else {
			player.vX = -3;
		};
		
		if (player.moveUp) {
			player.vY = -3;
		};
		
		if (player.moveDown) {
			player.vY = 3;
		};
		
		player.x += player.vX;
		player.y += player.vY;
		
		// Player boundary detection
		if (player.x-player.halfWidth < 20) {
			player.x = 20+player.halfWidth;
		} else if (player.x+player.halfWidth > canvasWidth-20) {
			player.x  = canvasWidth-20-player.halfWidth;
		}
		
		if (player.y-player.halfHeight < 20) {
			player.y = 20+player.halfHeight;
		} else if (player.y+player.halfHeight > canvasHeight-20) {
			player.y = canvasHeight-20-player.halfHeight;
		};
		
		// Draw player
		if (player.moveRight) {
			context.save();
			context.translate(player.x, player.y);
			
			if (player.flameLength == 20) {
				player.flameLength = 15;
			} else {
				player.flameLength = 20;
			};
			
			context.fillStyle = "orange";
			context.beginPath();
			context.moveTo(-12-player.flameLength, 0);
			context.lineTo(0, -5);
			context.lineTo(0, 5);
			context.closePath();
			context.fill();
			
			context.restore();
		};
		
		context.fillStyle = "rgb(255, 0, 0)";
		context.beginPath();
		context.moveTo(player.x+player.halfWidth, player.y);
		context.lineTo(player.x-player.halfWidth, player.y-player.halfHeight);
		context.lineTo(player.x-player.halfWidth, player.y+player.halfHeight);
		context.closePath();
		context.fill();
		
		// Add any new asteroids				
		while (asteroids.length < numAsteroids) {
			var radius = 5+(Math.random()*10);
			var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			asteroids.push(new Asteroid(x, y, radius, vX));
		};
		
		if (playGame) {
			// Run the animation loop again in 33 milliseconds
			setTimeout(animate, 33);
		};
	};