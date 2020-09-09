Z.superJumpPowerup = (function(base) {
	"use strict";
	
	var _powerup = Object.create(base);
	_powerup.jumpStrength = 0;
	_powerup.create = function(data) {
		var p = base.create.call(
			this,
			data,
			function() {
				Z.player.jumpStrength = data.jumpStrength;
			},
			function() {
				Z.player.jumpStrength = Z.content.items["player"].jumpStrength;
			}
		);
		p.jumpStrength = data.jumpStrength || 0;
		return p;
	};
	_powerup.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add powerup properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		// Time
		if (
			this.time && (
				!Z.content.items[this.type].hasOwnProperty("time") ||
				Z.content.items[this.type].time === null ||
				Z.content.items[this.type].time != this.time
			)
		) {
			data.time = this.time;
		}
		
		// Jump strength
		if (
			!Z.content.items[this.type].hasOwnProperty("jumpStrength") ||
			Z.content.items[this.type].jumpStrength === null ||
			Z.content.items[this.type].jumpStrength != this.jumpStrength
		) {
			data.jumpStrength = this.jumpStrength;
		}
		return data;
	};
	_powerup.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.time = null;		// Will use the value defined in content when null
		data.jumpStrength = null;
		return data;
	};
	_powerup.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Time
		properties.push({
			name: "Time",
			id: "time",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 30,
			round: true
		});
		
		// Jump strength
		properties.push({
			name: "Jump",
			id: "jumpStrength",
			type: Z.editorPropertyType.number,
			min: 5,
			max: 20
		});
		return properties;
	};
	return _powerup;
}(Z.powerup));