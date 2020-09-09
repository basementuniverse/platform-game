Z.healthPowerup = (function(base) {
	"use strict";
	
	var _powerup = Object.create(base);
	_powerup.amount = 0;
	_powerup.create = function(data) {
		var p = base.create.call(this, data, function() {
				// If health amount is negative, damage the player instead of adding health
				if (data.amount < 0) {
					Z.player.damage(Math.abs(data.amount));
				
				// Otherwise, add a health point to the player (up to the maximum)
				} else {
					Z.player.health = Math.clamp(
						Z.player.health + data.amount,
						0,
						Z.player.maxHealth
					);
				}
			}, null);
		p.amount = data.amount || 0;
		return p;
	};
	_powerup.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add powerup properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		// Amount
		if (
			!Z.content.items[this.type].hasOwnProperty("amount") ||
			Z.content.items[this.type].amount === null ||
			Z.content.items[this.type].amount != this.amount
		) {
			data.amount = this.amount;
		}
		return data;
	};
	_powerup.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.amount = null;		// Will use the value defined in content when null
		return data;
	};
	_powerup.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Amount
		properties.push({
			name: "Health",
			id: "amount",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 3,
			round: true
		});
		return properties;
	};
	return _powerup;
}(Z.powerup));