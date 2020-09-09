Z.superSpeedPowerup = (function(base) {
	"use strict";
	
	var _powerup = Object.create(base);
	_powerup.maxSpeed = 0;
	_powerup.create = function(data) {
		var p = base.create.call(
			this,
			data,
			function() {
				Z.player.maxSpeed = data.maxSpeed;
			},
			function() {
				Z.player.maxSpeed = Z.content.items["player"].maxSpeed;
			}
		);
		p.maxSpeed = data.maxSpeed || 0;
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
		
		// Max speed
		if (
			!Z.content.items[this.type].hasOwnProperty("maxSpeed") ||
			Z.content.items[this.type].maxSpeed === null ||
			Z.content.items[this.type].maxSpeed != this.maxSpeed
		) {
			data.maxSpeed = this.maxSpeed;
		}
		return data;
	};
	_powerup.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.time = null;		// Will use the value defined in content when null
		data.maxSpeed = null;
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
		
		// Maximum speed
		properties.push({
			name: "Speed",
			id: "maxSpeed",
			type: Z.editorPropertyType.number,
			min: 50,
			max: 500
		});
		return properties;
	};
	return _powerup;
}(Z.powerup));