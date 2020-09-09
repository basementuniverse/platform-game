Z.counter = (function(base) {
	"use strict";
	
	var _counter = Object.create(base);
	_counter.target = 0;
	_counter.loop = false;
	_counter.count = 0;
	_counter.internalState = false;
	_counter.create = function(data) {
		var c = base.create.call(this, data.id, vec2(data.position), data.inputs);
		c.type = "counter";
		c.target = data.target || 0;
		c.loop = !!data.loop;
		c.count = 0;
		c.internalState = false;
		return c;
	};
	_counter.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.target = this.target;
		data.loop = this.loop;
		return data;
	};
	_counter.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.target = 0;
		data.loop = false;
		return data;
	};
	_counter.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Target
		properties.push({
			name: "Target Amount",
			id: "target",
			type: Z.editorPropertyType.number,
			round: true
		});
		
		// Loop
		properties.push({
			name: "Loop",
			id: "loop",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_counter.setState = function(activated) {
		// Increment count when changing from deactivated to activated
		if (!this.internalState && activated) {
			this.internalState = true;
			this.count++;
			
			// Clamp count, or loop back to 0 if looping is enabled
			if (this.count > this.target) {
				this.count = this.loop ? 0 : this.target;
			}
		}
		if (!activated) {
			this.internalState = false;
		}
		
		// If target count is reached, activate this entity
		this.activated = (this.count == this.target);
	};
	return _counter;
}(Z.entity));