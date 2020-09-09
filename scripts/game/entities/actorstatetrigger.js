Z.actorStateTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.actorId = "";
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "actorstate";
		t.actorId = data.actorId || "";
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.actorId = this.actorId;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.actorId = "";
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Actor id
		properties.push({
			name: "Actor",
			id: "actorId",
			type: Z.editorPropertyType.connect,
			typeFilter: [
				"character",
				"decoration",
				"door",
				"platform"
			]
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		// Update target actor active state (if target actor exists)
		if (Z.game.map.actorsById[this.actorId]) {
			Z.game.map.actorsById[this.actorId].active = this.activated;
		}
		base.update.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));