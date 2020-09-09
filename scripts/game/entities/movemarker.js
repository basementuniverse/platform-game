Z.moveMarker = (function(base) {
	"use strict";
	
	var VELOCITY_THRESHOLD = 1 / 60;	// Activate if actor is moving more than 1 pixel per second
	
	var _marker = Object.create(base);
	_marker.create = function(data) {
		var m = base.create.call(this, data, function(a) {
				return vec2.len(a.velocity) > VELOCITY_THRESHOLD;
			});
		m.type = "move";
		return m;
	};
	return _marker;
}(Z.collisionMarker));