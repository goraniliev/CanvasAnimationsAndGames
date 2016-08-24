// Reset and start the game
	function startGame() {
		// Reset game stats
		uiScore.html("0");
		uiStats.show();
		
		// Set up initial game settings
		playGame = false;
		asteroids = new Array();
		numAsteroids = 10;
		score = 0;
		
		player = new Player(150, canvasHeight/2);
		
		score = 0;
		
		// Set up asteroids out of view
		for (var i = 0; i < numAsteroids; i++) {
			var radius = 5+(Math.random()*10);
			var x = canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			asteroids.push(new Asteroid(x, y, radius, vX));
		};
	    
	    //document.addEventListener("keyup", function, false);
		// Set up keyboard event listeners
		$(window).keydown(function(e) {
			var keyCode = e.keyCode;
			
			if (playGame == false) {
				playGame = true;
								 
				// Start the background sound
				soundBackground.currentTime = 0;
				soundBackground.play();
				
				// Start the animation loop
				animate();
				
				// Start game timer
				timer();
			};
			
			if (keyCode == arrowRight) {
				player.moveRight = true;
				
				// Play sound
				if (soundThrust.paused) {
					soundThrust.currentTime = 0;
					soundThrust.play();
				};
			} else if (keyCode == arrowUp) {
				player.moveUp = true;
			} else if (keyCode == arrowDown) {
				player.moveDown = true;
			};		
		});
		
		$(window).keyup(function(e) {
			var keyCode = e.keyCode;
			
			if (keyCode == arrowRight) {
				player.moveRight = false;
	
				// Stop sound
				soundThrust.pause();
			} else if (keyCode == arrowUp) {
				player.moveUp = false;
			} else if (keyCode == arrowDown) {
				player.moveDown = false;
			};
		});
		
		// Start the animation loop
		animate();
	};