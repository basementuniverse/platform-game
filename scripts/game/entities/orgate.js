Z.orGate = (function(base) {
	"use strict";
	
	var _gate = Object.create(base);
	_gate.create = function(data) {
		var g = base.create.call(this, data.id, vec2(data.position), data.inputs);
		g.type = "or";
		return g;
	};
	_gate.update = function(elapsedTime) {
		// Check if any input entities are activated and update active state accordingly
		var anyInputsActivated = false;
		for (var i = this.inputs.length; i--;) {
			if (this.inputs[i].activated) {
				anyInputsActivated = true;
			}
		}
		this.setState(anyInputsActivated);
	};
	return _gate;
}(Z.entity));