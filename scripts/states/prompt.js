Z.prompt = (function() {
	"use strict";
	
	var BACKGROUND_COLOUR = "rgba(0, 0, 0, 0.9)",
		COLOUR = "white",
		TEXT_OFFSET = vec2(0, -25),
		MENU_OFFSET = vec2(0, 25);
	
	return {
		state: null,
		text: "",
		menu: null,
		create: function(text, yes, no) {
			var p = Object.create(this);
			p.text = text;
			p.state = {
				transparent: true,
				transitionType: Z.stateTransition.transitionIn,
				transitionAmount: 0
			};
			
			// Create menu
			p.menu = Z.menu.create(vec2(), MENU_OFFSET);
			p.menu.push(Z.menuItem.create(yes.text || "Yes", yes.action));
			p.menu.push(Z.menuItem.create(no.text || "No", no.action));
			return p;
		},
		update: function(elapsedTime) {
			this.menu.update(elapsedTime);
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
			context.fillStyle = COLOUR;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(this.text, size.X / 2 + TEXT_OFFSET.X, size.Y / 2 + TEXT_OFFSET.Y);
			
			// Draw menu
			this.menu.draw(context, size.X, size.Y, this.state);
			context.restore();
		}
	};
}());