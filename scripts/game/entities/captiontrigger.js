Z.captionTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.message = "";
	_trigger.actorId = "";
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "caption";
		t.message = data.message || "";
		t.actorId = data.actorId || "";
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.message = this.message;
		data.actorId = this.actorId;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.message = "";
		data.actorId = "";
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Message
		properties.push({
			name: "Message",
			id: "message",
			type: Z.editorPropertyType.text
		});
		
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
		return properties;
	};
	_trigger.setState = function(activated) {
		// Create caption when changing from deactivated to activated
		if (!this.activated && activated) {
			Z.captionManager.add(this.message, this.actorId);
		}
		base.setState.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));