Z.caption = (function() {
	"use strict";
	
	var FADE_TIME = 0.5;		// The fade out time, in seconds
	
	return {
		canvas: null,
		message: "",
		timeout: 0,
		colour: "",
		backgroundColour: "",
		create: function(message, timeout, colour, backgroundColour) {
			var c = Object.create(this),
				context = null;
			c.message = message;
			c.timeout = timeout;
			c.colour = colour;
			c.backgroundColour = backgroundColour;
			
			// Create canvas and draw caption text
			c.canvas = document.createElement("canvas");
			c.drawText();
			return c;
		},
		update: function(elapsedTime) {
			this.timeout = Math.max(this.timeout - elapsedTime, 0);
		},
		drawText: function() { },
		draw: function(context, position) {
			context.save();
			
			// If this caption is about to expire, fade it out
			if (this.timeout < FADE_TIME) {
				context.globalAlpha = this.timeout / FADE_TIME;
			}
			context.drawImage(this.canvas, position.X, position.Y);
			context.restore();
		}
	};
}());