Z.mainMenu = (function() {
	"use strict";
	
	var MENU_ANCHOR = vec2(0, 0),
		MENU_OFFSET = vec2(40, 0),
		BACKGROUND_COLOUR = "black";
	
	return {
		state: {
			transparent: false,
			transitionType: Z.stateTransition.transitionIn,
			transitionAmount: 0
		},
		image: null,
		menu: null,
		initialise: function() {
			this.image = Z.content.items["mainmenu"];
			this.menu = Z.menu.create(MENU_ANCHOR, MENU_OFFSET);
			
			// Start game button
			this.menu.push(Z.menuItem.create("Start Game", function() {
				Z.stateManager.pop();
				Z.stateManager.push(Z.game);
			}));
			
			// Load game button
			this.menu.push(Z.menuItem.create("Load Game", function() {
				// TODO load game...
				Z.stateManager.push(Z.message.create(
					"Not implemented yet!",
					Z.messageType.information
				));
			}));
			
			// Audio enabled/disabled button
			var label = Z.settings.audioEnabled ? "Audio Enabled" : "Audio Disabled";
			this.menu.push(Z.menuItem.create(label, function() {
				Z.settings.audioEnabled = !Z.settings.audioEnabled;
				Z.mainMenu.menu.items[2].text = Z.settings.audioEnabled ?
					"Audio Enabled" :
					"Audio Disabled";
			}));
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
			
			// Draw background
			var size = vec2.div(vec2(width, height), Z.settings.scale)
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, size.X, size.Y);
			
			// Draw background image
			var aspectRatio = this.image.width / this.image.height;
			context.drawImage(this.image, 0, 0, size.Y * aspectRatio, size.Y);
			
			// Draw menu
			this.menu.draw(context, size.X, size.Y, this.state);
			context.restore();
		}
	};
}());