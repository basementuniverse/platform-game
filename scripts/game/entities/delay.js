Z.delay = (function(base) {
	"use strict";
	
	var _delay = Object.create(base);
	_delay.time = 0;
	_delay.internalState = false;
	_delay.events = [];
	_delay.create = function(data) {
		var d = base.create.call(this, data.id, vec2(data.position), data.inputs);
		d.type = "delay";
		d.time = data.time || 0;
		d.internalState = false;
		d.events = [];
		return d;
	};
	_delay.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.time = this.time;
		return data;
	};
	_delay.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.time = 0;
		return data;
	};
	_delay.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Delay
		properties.push({
			name: "Delay",
			id: "delay",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 30
		});
		return properties;
	};
	_delay.setState = function(activated) {
		if (activated != this.internalState) {
			this.internalState = activated;
			this.events.push({
				state: activated,
				time: this.time
			});
		}
	};
	_delay.update = function(elapsedTime) {
		// Update events
		for (var i = 0, length = this.events.length; i < length; i++) {
			this.events[i].time -= elapsedTime;
			
			// Set activated state if this event has expired
			if (this.events[i].time <= 0) {
				this.activated = this.events[i].state;
			}
		}
		
		// Remove expired events
		this.events = this.events.filter(function(e) { return e.time > 0; });
		base.update.apply(this, arguments);
	};
	return _delay;
}(Z.entity));