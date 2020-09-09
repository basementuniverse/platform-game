Z.hud = (function() {
	"use strict";
	
	var HEIGHT = 14,
		BACKGROUND_COLOUR = "rgba(0, 0, 0, 0.7)",
		HEALTH_OFFSET = vec2(5, 2),
		OXYGEN_OFFSET = vec2(5, -13),
		TEXT_COLOUR = "white",
		TEXT_OFFSET = vec2(5, 2),
		POINTS_TEXT_SIZE = "8pt",
		POWERUPS_TEXT_SIZE = "6pt",
		POWERUPS_TEXT_OFFSET = vec2(10, 0),
		POWERUPS_TEXT_BACKGROUND_COLOUR = "rgba(255, 255, 255, 0.8)",
		POWERUPS_TEXT_COLOUR = "black",
		POWERUPS_ICON_SIZE = vec2(10, 10),
		POWERUPS_COUNT_SIZE = 4,
		POWERUPS_CANVAS_MARGIN = 20,
		ICON_MARGIN = vec2(5, 0);
	
	var _powerupsCanvas = null,	// Draw active powerups and inventory onto a separate canvas
		_powerupsContext = null;
	
	// Draw a powerup icon onto the specified context
	var drawPowerup = function(context, sprite, index, fadeAmount) {
		context.save();
		context.globalAlpha = fadeAmount;
		drawIcon(context, sprite, index);
		context.restore();
	};
	
	// Draw an inventory item icon onto the specified context
	var drawInventory = function(context, sprite, index, count) {
		drawIcon(context, sprite, index);
		
		// Draw counter (if player has more than 1 of this item)
		if (count > 1) {
			var position = vec2((POWERUPS_ICON_SIZE.X + ICON_MARGIN.X) * index, ICON_MARGIN.Y);
			position = vec2.add(vec2.add(position, POWERUPS_TEXT_OFFSET), POWERUPS_CANVAS_MARGIN);
			context.save();
			context.fillStyle = POWERUPS_TEXT_BACKGROUND_COLOUR;
			context.beginPath();
			context.arc(position.X, position.Y, POWERUPS_COUNT_SIZE, 0, Math.PI * 2);
			context.closePath();
			context.fill();
			context.fillStyle = POWERUPS_TEXT_COLOUR;
			context.font = POWERUPS_TEXT_SIZE + " " + Z.settings.font;
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillText(count, position.X, position.Y);
			context.restore();
		}
	};
	
	// Draw the specified sprite (using the hud animation) onto the specified context
	var drawIcon = function(context, sprite, index) {
		var originalAnimation = sprite.animation;
		sprite.animation = "hud";
		sprite.draw(
			context,
			vec2.add(
				vec2((POWERUPS_ICON_SIZE.X + ICON_MARGIN.X) * index, ICON_MARGIN.Y),
				POWERUPS_CANVAS_MARGIN
			),
			vec2(1, 0)
		);
		sprite.animation = originalAnimation;
	};
	
	return {
		sprite: null,
		initialise: function() {
			this.sprite = Z.sprite.create(Z.content.items["hud"]);
			this.sprite.animation = "health";
			
			// Initialise powerups/inventory canvas and context
			_powerupsCanvas = document.createElement("canvas");
			_powerupsContext = _powerupsCanvas.getContext("2d");
		},
		update: function(elapsedTime) {
			this.sprite.update(elapsedTime);
		},
		draw: function(context, width, height) {
			context.save();
			context.setTransform(Z.settings.scale, 0, 0, Z.settings.scale, 0, 0);
			context.translate(0, Z.camera.size.Y - HEIGHT);
			
			// Draw background
			context.fillStyle = BACKGROUND_COLOUR;
			context.fillRect(0, 0, width / Z.settings.scale, HEIGHT);
			
			// Draw player health (left aligned)
			this.sprite.animation = "health";
			for (var i = Z.player.health; i--;) {
				this.sprite.draw(
					context,
					vec2.add(
						HEALTH_OFFSET,
						vec2((ICON_MARGIN.X + this.sprite.tileSize.X) * i, ICON_MARGIN.Y)
					),
					vec2(1, 0)
				);
			}
			
			// Draw player oxygen (if in non-breathable liquid)
			if (!Z.player.canBreathe) {
				this.sprite.animation = "oxygen";
				for (var i = 0, length = Z.player.maxOxygen; i < length; i++) {
					this.sprite.animation = (i < Z.player.oxygen) ? "oxygen" : "oxygen_depleted";
					this.sprite.draw(
						context,
						vec2.add(
							OXYGEN_OFFSET,
							vec2((ICON_MARGIN.X + this.sprite.tileSize.X) * i, ICON_MARGIN.Y)
						),
						vec2(1, 0)
					);
				}
			}
			
			// Draw currently active powerups and inventory
			var powerupKeys = Object.keys(Z.player.powerups),
				inventoryKeys = Object.keys(Z.player.inventory),
				count = powerupKeys.length + inventoryKeys.length,
				powerupsCanvasSize = vec2.add(vec2(
					(POWERUPS_ICON_SIZE.X + ICON_MARGIN.X) * count,
					POWERUPS_ICON_SIZE.Y + ICON_MARGIN.Y
				), POWERUPS_CANVAS_MARGIN * 2),
				index = 0;
			powerupKeys.sort();
			inventoryKeys.sort();
			
			// Resize and clear powerups/inventory canvas
			_powerupsCanvas.width = powerupsCanvasSize.X;
			_powerupsCanvas.height = powerupsCanvasSize.Y;
			_powerupsContext.clearRect(0, 0, powerupsCanvasSize.X, powerupsCanvasSize.Y);
			
			// Draw powerup/inventory icons
			for (var i = 0, length = powerupKeys.length; i < length; i++) {		// Powerups
				drawPowerup(
					_powerupsContext,
					Z.player.powerups[powerupKeys[i]].sprite,
					index++,
					Z.player.powerups[powerupKeys[i]].time
				);
			}
			for (var i = 0, length = inventoryKeys.length; i < length; i++) {	// Inventory
				drawInventory(
					_powerupsContext,
					Z.player.inventory[inventoryKeys[i]].sprite,
					index++,
					Z.player.inventory[inventoryKeys[i]].count
				);
			}
			
			// Draw powerups canvas onto the main context (centered)
			var powerupsOffset = vec2.sub(
					vec2.div(vec2(Z.camera.size.X, HEIGHT), 2),
					vec2.div(powerupsCanvasSize, 2)
				);
			context.drawImage(_powerupsCanvas, powerupsOffset.X, powerupsOffset.Y);
			
			// Draw player points (right aligned)
			context.font = POINTS_TEXT_SIZE + " " + Z.settings.font;
			context.fillStyle = TEXT_COLOUR;
			context.textBaseline = "top";
			context.textAlign = "right";
			context.fillText(Z.player.points, Z.camera.size.X - TEXT_OFFSET.X, TEXT_OFFSET.Y);
			context.restore();
		}
	};
}());