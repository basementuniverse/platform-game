Z.mapTransition = (function() {
	"use strict";
	
	var BACKGROUND_COLOUR = "black";
	
	return {
		state: null,
		callback: null,
		create: function(callback) {
			var t = Object.create(this);
			t.state = {
				transparent: true,
				transitionType: Z.stateTransition.transitionIn,
				transitionTime: 1,
				transitionAmount: 0
			};
			t.callback = callback;
			return t;
		},
		update: function(elapsedTime) {
			// When transition in has finished, callback and immediately pop this state
			if (
				this.state.transitionType == Z.stateTransition.transitionIn &&
				this.state.transitionAmount >= 1
			) {
				this.callback();
				this.callback = null;
				Z.stateManager.pop();
			}
		},
		draw: function(context, width, height) {
			context.save();
			
			// State transition (fade in/out)
			var amount = this.state.transitionAmount;
			if (this.state.transitionType == Z.stateTransition.transitionOut) {
				amount = 1 - amount;
			}
			context.globalAlpha = amount;
			
			// Draw background
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, width, height);
			context.restore();
		}
	};
}());