Z.message = (function() {
	"use strict";
	
	var BACKGROUND_COLOUR = "rgba(0, 0, 0, 0.9)",
		INFORMATION_COLOUR = "white",
		ERROR_COLOUR = "#f22",
		ERROR_ICON_MARGIN = 5,
		CONTINUE_TEXT = "Press a key to continue...",
		CONTINUE_MARGIN = 30;
	
	return {
		state: null,
		text: "",
		continueText: "",
		type: Z.messageType.information,
		create: function(text, type, continueText) {
			var m = Object.create(this);
			m.text = text;
			m.type = type;
			m.continueText = continueText || CONTINUE_TEXT;
			m.state = {
				transparent: true,
				transitionType: Z.stateTransition.transitionIn,
				transitionAmount: 0
			};
			return m;
		},
		handleInput: function() {
			// Close information messages when a key is pressed
			if (this.type == Z.messageType.information && Z.input.keyPressed()) {
				Z.stateManager.pop();
			}
		},
		update: function(elapsedTime) {
			this.handleInput();
		},
		draw: function(context, width, height) {
			context.save();
			context.setTransform(Z.settings.scale, 0, 0, Z.settings.scale, 0, 0);
			
			// State transition (fade in/out)
			var amount = this.state.transitionAmount;
			if (this.state.transitionType == Z.stateTransition.transitionOut) {
				amount = 1 - amount;
			}
			context.globalAlpha = amount;
			
			// Fill background
			var size = vec2.div(vec2(width, height), Z.settings.scale);
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, size.X, size.Y);
			
			// Draw text
			context.font = Z.settings.fontSize + " " + Z.settings.font;
			context.fillStyle = this.type == Z.messageType.information ?
				INFORMATION_COLOUR :
				ERROR_COLOUR;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(this.text, size.X / 2, size.Y / 2);
			
			// If this is an error message, draw error icon
			if (this.type == Z.messageType.error) {
				var textWidth = context.measureText(this.text).width,
					errorIcon = Z.content.items["error"];
				context.drawImage(
					errorIcon,
					size.X / 2 - textWidth / 2 - errorIcon.width - ERROR_ICON_MARGIN,
					size.Y / 2 - errorIcon.height / 2
				);
			} else {	// Otherwise display 'continue' text (for information messages)
				context.fillText(this.continueText, size.X / 2, size.Y / 2 + CONTINUE_MARGIN);
			}
			context.restore();
		}
	};
}());