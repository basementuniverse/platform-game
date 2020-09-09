Z.cameraTargetTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.actorId = "";
	_trigger.transition = false;
	_trigger.cameraInitialTarget = null;
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "cameratarget";
		t.actorId = data.actorId || "";
		t.transition = !!data.transition;
		
		// Keep a reference to the camera's initial target actor so that the target can be reset
		// when deactivated (this gets populated when the entity is activated)
		t.cameraInitialTarget = null;
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.actorId = this.actorId;
		data.transition = this.transition;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.actorId = "";
		data.transition = false;
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
				"block",
				"character",
				"decoration",
				"door",
				"platform",
				"player"
			]
		});
		
		// Transition
		properties.push({
			name: "Transition",
			id: "transition",
			type: Z.editorPropertyType.toggle,
			labelOn: "On",
			labelOff: "Off"
		});
		return properties;
	};
	_trigger.setState = function(activated) {
		// Change camera target when activated
		if (!this.activated && activated) {
			// Set the initial target
			this.cameraInitialTarget = Z.camera.targetActor;
			
			// Find target actor
			if (Z.game.map.actorsById[this.actorId]) {
				Z.camera.initialise(Z.game.map.actorsById[this.actorId], !this.transition);
			}
		
		// Otherwise reset camera target to the initial actor
		} else if (this.activated && !activated) {
			Z.camera.initialise(
				this.cameraInitialTarget || Z.player,
				!this.transition
			);
		}
		base.setState.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));