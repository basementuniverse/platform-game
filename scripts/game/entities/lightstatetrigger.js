Z.lightStateTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.lightId = "";
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "lightstate";
		t.lightId = data.lightId || "";
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.lightId = this.lightId;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.lightId = "";
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Light id
		properties.push({
			name: "Light",
			id: "lightId",
			type: Z.editorPropertyType.connect,
			typeFilter: [
				"ambient",
				"point",
				"spot"
			]
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		// Update target light active state (if target light exists)
		if (Z.game.map.lightsById[this.lightId]) {
			Z.game.map.lightsById[this.lightId].active = this.activated;
		}
		base.update.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));