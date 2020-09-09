Z.inventoryPowerup = (function(base) {
	"use strict";
	
	var _powerup = Object.create(base);
	_powerup.stackable = false;
	_powerup.maxCount = 0;
	_powerup.create = function(data) {
		var p = base.create.call(this, data, null, null);
		
		// When picked up, add a reference to this powerup's sprite to the player's inventory
		// (indexed by the powerup type) so that it can be displayed in the hud
		p.pickup = function() {
			Z.player.addInventory(data.type, p.sprite, 1, data.stackable, data.maxCount);
		};
		p.stackable = !!data.stackable;
		p.maxCount = data.maxCount || 0;
		return p;
	};
	_powerup.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add powerup properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		// Stackable
		if (
			!Z.content.items[this.type].hasOwnProperty("stackable") ||
			Z.content.items[this.type].stackable === null ||
			Z.content.items[this.type].stackable != this.stackable
		) {
			data.stackable = this.stackable;
		}
		
		// Max count
		if (
			!Z.content.items[this.type].hasOwnProperty("maxCount") ||
			Z.content.items[this.type].maxCount === null ||
			Z.content.items[this.type].maxCount != this.maxCount
		) {
			data.maxCount = this.maxCount;
		}
		return data;
	};
	_powerup.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.stackable = null;		// Will use the value defined in content when null
		data.maxCount = null;
		return data;
	};
	_powerup.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Stackable
		properties.push({
			name: "Stackable",
			id: "stackable",
			type: Z.editorPropertyType.toggle
		});
		
		// Maximum
		properties.push({
			name: "Maximum",
			id: "maxCount",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 5,
			round: true
		});
		return properties;
	};
	return _powerup;
}(Z.powerup));