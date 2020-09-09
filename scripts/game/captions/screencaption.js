Z.screenCaption = (function(base) {
	"use strict";
	
	var MINIMUM_SIZE = vec2(150, 100),
		TEXT_SIZE = "6pt",
		LINE_HEIGHT = 7,
		PADDING = 5,
		MARGIN = 5,
		COLOUR = "white",
		BACKGROUND_COLOUR = "black";
	
	var _caption = Object.create(base);
	_caption.screenWidth = 0;
	_caption.create = function(message, timeout, colour, backgroundColour) {
		var c = base.create.call(
				this,
				message,
				timeout,
				colour || COLOUR,
				backgroundColour || BACKGROUND_COLOUR
			);
		c.screenWidth = MINIMUM_SIZE.X;
		return c;
	};
	_caption.drawText = function() {
		// Resize canvas
		this.canvas.width = Math.max(MINIMUM_SIZE.X, Z.camera.size.X - (MARGIN * 2));
		this.canvas.height = Math.max(MINIMUM_SIZE.Y, Z.camera.size.Y - (MARGIN * 2));
		
		// Get context and draw caption text
		var context = this.canvas.getContext("2d");
		Z.utilities.drawWrappedText(
			context,
			this.message,
			TEXT_SIZE + " " + Z.settings.font,
			vec2(),
			this.canvas.width,
			LINE_HEIGHT,
			PADDING,
			this.colour,
			this.backgroundColour,
			false,
			0
		);
	};
	_caption.draw = function(context, position) {
		if (this.screenWidth != Z.camera.size.X) {
			this.screenWidth = Z.camera.size.X;
			this.drawText();
		}
		base.draw.call(this, context, vec2.add(position, MARGIN));
	};
	return _caption;
}(Z.caption));