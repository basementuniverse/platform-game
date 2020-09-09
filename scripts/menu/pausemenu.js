Z.pauseMenu = (function() {
	"use strict";
	
	var MENU_ANCHOR = vec2(0, 0),
		MENU_OFFSET = vec2(0, 0),
		BACKGROUND_COLOUR = "rgba(0, 0, 0, 0.9)";
	
	return {
		state: {
			transparent: true,
			transitionType: Z.stateTransition.transitionIn,
			transitionAmount: 0
		},
		menu: null,
		initialise: function() {
			this.menu = Z.menu.create(MENU_ANCHOR, MENU_OFFSET);
			
			// Resume game button
			this.menu.push(Z.menuItem.create("Resume Game", function() {
				Z.stateManager.pop();
			}));
			
			// Save game button
			this.menu.push(Z.menuItem.create("Save Game", function() {
				// TODO save game...
				Z.stateManager.push(Z.message.create(
					"Not implemented yet!",
					Z.messageType.information
				));
			}));
			
			// Audio enabled/disabled button
			var label = Z.settings.audioEnabled ? "Audio Enabled" : "Audio Disabled";
			this.menu.push(Z.menuItem.create(label, function() {
				Z.settings.audioEnabled = !Z.settings.audioEnabled;
				Z.pauseMenu.menu.items[2].text = Z.settings.audioEnabled ?
					"Audio Enabled" :
					"Audio Disabled";
			}));
			
			// Exit to main menu button
			this.menu.push(Z.menuItem.create("Exit to Main Menu", function() {
				Z.stateManager.push(Z.prompt.create(
					"Are you sure you want to quit?",
					{
						text: "No",
						action: function() {
							Z.stateManager.pop();
						}
					},
					{
						text: "Yes",
						action: function() {
							Z.stateManager.clear();
							Z.stateManager.push(Z.mainMenu);
						}
					}
				));
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
			var size = vec2.div(vec2(width, height), Z.settings.scale);
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, size.X, size.Y);
			
			// Draw menu
			this.menu.draw(context, size.X, size.Y, this.state);
			context.restore();
		}
	};
}());