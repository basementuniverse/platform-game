Z.nandGate = (function(base) {
	"use strict";
	
	var _gate = Object.create(base);
	_gate.create = function(data) {
		var g = base.create.call(this, data.id, vec2(data.position), data.inputs);
		g.type = "nand";
		return g;
	};
	_gate.setState = function(activated) {
		// Since entities act like 'and' gates by default, just invert state
		this.activated = !activated;
	};
	return _gate;
}(Z.entity));