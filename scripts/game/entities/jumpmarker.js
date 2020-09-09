Z.jumpMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.create = function(data) {
		var m = base.create.call(this, data, function(a) {
				return a.jumping;
			});
		m.type = "jump";
		return m;
	};
	return _marker;
}(Z.collisionMarker));