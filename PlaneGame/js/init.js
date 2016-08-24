function init() {
		uiStats.hide();
		uiComplete.hide();
		
		uiPlay.click(function(e) {
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});
		
		uiReset.click(function(e) {
			e.preventDefault();
			uiComplete.hide();
			
			// Stop sound
			soundThrust.pause();
			soundBackground.pause();
			
			clearTimeout(scoreTimeout);
			
			$(window).unbind("keyup");
			$(window).unbind("keydown");
			
			startGame();
		});
	};