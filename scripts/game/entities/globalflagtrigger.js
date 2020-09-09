Z.globalFlagTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.globalFlagId = "";
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "global";
		t.globalFlagId = data.globalFlagId || "";
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.globalFlagId = this.globalFlagId;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.globalFlagId = "";
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Global flag id
		properties.push({
			name: "Global Flag",
			id: "globalFlagId",
			type: Z.editorPropertyType.text
		});
		return properties;
	};
	_trigger.setState = function(activated) {
		// Update global flag state when entity state changes
		Z.game.globalFlags[this.globalFlagId] = activated;
		base.setState.apply(this, arguments);
	};
	_trigger.update = function(elapsedTime) {
		// If this entity has no inputs, just use the global flag state
		if (!this.inputs.length) {
			this.activated = !!Z.game.globalFlags[this.globalFlagId];
		
		// Otherwise set state based on inputs
		} else {
			base.update.apply(this, arguments);
		}
	};
	return _trigger;
}(Z.entity));