Z.latch = (function(base) {
	"use strict";
	
	var _latch = Object.create(base);
	_latch.latch = false;
	_latch.toggle = false;
	_latch.create = function(data) {
		var l = base.create.call(this, data.id, vec2(data.position), data.inputs);
		l.type = "latch";
		l.latch = false;
		l.toggle = !!data.toggle;
		return l;
	};
	_latch.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.toggle = this.toggle;
		return data;
	};
	_latch.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.toggle = false;
		return data;
	};
	_latch.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Toggle
		properties.push({
			name: "Toggle",
			id: "toggle",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_latch.setState = function(activated) {
		// If this is a toggle latch, invert state when changing from deactivated to activated
		if (this.toggle) {
			if (activated != this.latch) {
				this.latch = activated;
				if (activated) {
					this.activated = !this.activated;
				}
			}
		
		// Otherwise activate the first time and stay activated
		} else if (activated) {
			base.setState.apply(this, arguments);
		}
	};
	return _latch;
}(Z.entity));