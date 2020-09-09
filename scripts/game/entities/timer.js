Z.timer = (function(base) {
	"use strict";
	
	var _timer = Object.create(base);
	_timer.time = 0;
	_timer.repeat = false;
	_timer.totalTime = 0;
	_timer.lastPulseTime = 0;
	_timer.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "timer";
		t.time = data.time || 0;
		t.repeat = !!data.repeat;
		t.totalTime = 0;
		t.lastPulseTime = 0;
		return t;
	};
	_timer.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.time = this.time;
		data.repeat = this.repeat;
		return data;
	};
	_timer.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.time = 0;
		data.repeat = false;
		return data;
	};
	_timer.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Time
		properties.push({
			name: "Time",
			id: "time",
			type: Z.editorPropertyType.number
		});
		
		// Repeat
		properties.push({
			name: "Repeat",
			id: "repeat",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_timer.update = function(elapsedTime) {
		// Increment total time
		this.totalTime += elapsedTime;
		
		// Timer is deactivated by default
		this.setState(false);
		
		// Activate if time has been reached (or a multiple of time if this is a repeating timer)
		if (this.repeat) {
			if (this.totalTime >= this.lastPulseTime + this.time) {
				this.lastPulseTime = this.totalTime;
				this.setState(true);
			}
		} else if (this.totalTime >= this.time && !this.lastPulseTime) {
			this.lastPulseTime = this.totalTime;
			this.setState(true);
		}
	};
	return _timer;
}(Z.entity));