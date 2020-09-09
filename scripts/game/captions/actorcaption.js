Z.actorCaption = (function(base) {
	"use strict";
	
	var MAXIMUM_SIZE = vec2(150, 200),
		MINIMUM_WIDTH = 30,
		TEXT_SIZE = "6pt",
		LINE_HEIGHT = 7,
		PADDING = 2,
		COLOUR = "black",
		BACKGROUND_COLOUR = "white",
		OFFSET_Y = -14,
		ARROW_OFFSET_X = 6,
		ARROW_ANGLE_X = -1,
		ARROW_SIZE = vec2(7, 7);
	
	var _caption = Object.create(base);
	_caption.size = vec2();
	_caption.create = function(message, timeout, colour, backgroundColour) {
		var c = base.create.call(
				this,
				message,
				timeout,
				colour || COLOUR,
				backgroundColour || BACKGROUND_COLOUR
			);
		return c;
	};
	_caption.drawText = function() {
		// Resize canvas
		this.canvas.width = MAXIMUM_SIZE.X;
		this.canvas.height = MAXIMUM_SIZE.Y;
		
		// Get context and draw caption text
		var context = this.canvas.getContext("2d");
		this.size = Z.utilities.drawWrappedText(
			context,
			this.message,
			TEXT_SIZE + " " + Z.settings.font,
			vec2(),
			MAXIMUM_SIZE.X,
			LINE_HEIGHT,
			PADDING,
			this.colour,
			this.backgroundColour,
			true,
			MINIMUM_WIDTH
		);
		
		// Draw speech arrow
		context.save();
		context.fillStyle = this.backgroundColour;
		context.translate(this.size.X / 2 + ARROW_OFFSET_X, this.size.Y);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(ARROW_ANGLE_X, ARROW_SIZE.Y);
		context.lineTo(ARROW_SIZE.X, 0);
		context.closePath();
		context.fill();
		context.restore();
	};
	_caption.draw = function(context, position) {
		base.draw.call(
			this,
			context,
			vec2.sub(position, vec2(this.size.X / 2, this.size.Y - OFFSET_Y))
		);
	};
	return _caption;
}(Z.caption));