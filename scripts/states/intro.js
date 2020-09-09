Z.intro = (function() {
	"use strict";
	
	var BACKGROUND_COLOUR = "black",
		INTRO_SCALE = 2,
		TIMEOUT = 5;					// Time until proceeding to main menu (in seconds)
	
	return {
		state: {
			transparent: false,
			transitionType: Z.stateTransition.transitionIn,
			transitionTime: 2.5,
			transitionAmount: 0
		},
		image: null,
		timeout: null,
		initialise: function() {
			this.image = Z.content.items["intro"];
			this.timeout = TIMEOUT;
		},
		handleInput: function() {
			// Proceed to main menu when any key is pressed or if left mouse button is clicked
			if (Z.input.keyPressed()) {
				this.timeout = 0;
			}
		},
		update: function(elapsedTime) {
			this.handleInput();
			this.timeout -= elapsedTime;
			if (this.timeout <= 0) {
				Z.stateManager.pop();
				Z.stateManager.push(Z.mainMenu);
			}
		},
		draw: function(context, width, height) {
			context.save();
			context.scale(INTRO_SCALE, INTRO_SCALE);
			
			// Draw background
			var size = vec2.div(vec2(width, height), INTRO_SCALE);
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, size.X, size.Y);
			
			// Fade in intro image in center of screen
			if (this.state.transitionType == Z.stateTransition.transitionIn) {
				context.globalAlpha = this.state.transitionAmount;
			}
			context.translate(size.X / 2, size.Y / 2);
			context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
			context.restore();
		}
	};
}());