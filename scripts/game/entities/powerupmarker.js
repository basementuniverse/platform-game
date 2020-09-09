Z.powerupMarker = (function(base) {
	"use strict";
	
	var POWERUP_TYPES = [
		"superhealth",
		"invulnerable",
		"flying",
		"superspeed",
		"superjump",
		"powerattack",
		"autofire",
		"waterbreathing"
	];
	
	var _marker = Object.create(base);
	_marker.powerupType = "";
	_marker.remove = false;
	_marker.create = function(data) {
		var m = base.create.call(this, data, function(a) {
				return !!Z.player.powerups[data.powerupType];
			});
		m.type = "powerup";
		m.powerupType = data.powerupType || "";
		m.remove = !!data.remove;
		return m;
	};
	_marker.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.powerupType = this.powerupType;
		data.remove = this.remove;
		return data;
	};
	_marker.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.powerupType = "";
		data.remove = false;
		return data;
	};
	_marker.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Powerup type
		var powerupTypes = [];
		for (var i in Z.content.items) {
			if (
				Z.content.items.hasOwnProperty(i) &&
				POWERUP_TYPES.indexOf(Z.content.items[i].baseType) > -1
			) {
				powerupTypes.push({
					label: Z.content.items[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Powerup Type",
			id: "powerupType",
			type: Z.editorPropertyType.select,
			options: powerupTypes
		});
		
		// Remove
		properties.push({
			name: "Remove",
			id: "remove",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_marker.setState = function(activated) {
		base.setState.apply(this, arguments);
		
		// When this marker is activated, check if the specified powerup type should be removed
		// from the player's list of active powerups
		if (activated && this.remove && Z.player.powerups[this.powerupType]) {
			Z.player.powerups[this.powerupType].update(0, true);	// Force the powerup to expire
			delete Z.player.powerups[this.powerupType];
		}
	};
	return _marker;
}(Z.collisionMarker));