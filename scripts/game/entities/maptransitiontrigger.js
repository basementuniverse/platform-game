Z.mapTransitionTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.mapId = "";
	_trigger.targetId = "";
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "maptransition";
		t.mapId = data.mapId || "";
		t.targetId = data.targetId || "";
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.mapId = this.mapId;
		data.targetId = this.targetId;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.mapId = "";
		data.targetId = "";
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Map id
		var maps = [];
		for (var i in Z.world.maps) {
			if (Z.world.maps.hasOwnProperty(i)) {
				maps.push({
					label: Z.world.maps[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Map",
			id: "mapId",
			type: Z.editorPropertyType.select,
			options: maps
		});
		
		// Target id
		properties.push({
			name: "Target",
			id: "targetId",
			type: Z.editorPropertyType.custom
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		base.update.apply(this, arguments);
		if (this.activated) {
			this.activated = false;
			Z.game.changeMap(this.mapId, this.targetId);
		}
	};
	return _trigger;
}(Z.entity));