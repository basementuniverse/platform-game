Z.menuItem = (function() {
	"use strict";
	
	var ITEM_HEIGHT = 20,
		COLOUR = "rgba(255, 255, 255, 0.7)",
		SELECTED_COLOUR = "white",
		SELECTED_PREFIX = "> ";
	
	return {
		text: null,
		size: vec2(),
		action: null,
		selected: false,
		create: function(text, action) {
			var m = Object.create(this);
			m.text = text;
			m.action = action;
			
			// Calculate menu item size
			var context = document.createElement("canvas").getContext("2d");
			context.font = Z.settings.fontSize + " " + Z.settings.font;
			m.size = vec2(context.measureText(SELECTED_PREFIX + m.text).width, ITEM_HEIGHT);
			return m;
		},
		update: function(elapsedTime, index, selectedIndex) {
			this.selected = index == selectedIndex;
		},
		draw: function(context, width, height, index, itemMargin, state) {
			context.save();
			
			// State transition (slide menu items in from right)
			var amount = state.transitionAmount;
			if (state.transitionType == Z.stateTransition.transitionOut) {
				amount = 1 - amount;
			}
			context.translate(
				Math.lerp(width, 0, Math.clamp(amount * (index + 1))),
				index * ITEM_HEIGHT + index * itemMargin
			);
			context.fillStyle = this.selected ? SELECTED_COLOUR : COLOUR;
			context.font = Z.settings.fontSize + " " + Z.settings.font;
			context.textAlign = "left";
			context.textBaseline = "middle";
			
			// Show text 'selected' prefix or pad with spaces if unselected
			var prefix = this.selected ?
				SELECTED_PREFIX :
				(new Array(SELECTED_PREFIX.length + 1).join(" "));
			context.fillText(prefix + this.text, 0, ITEM_HEIGHT / 2);
			context.restore();
		}
	};
}());