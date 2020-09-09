Z.useMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.create = function(data) {
		data.filterType = "player";
		var m = base.create.call(this, data, function(a) {
				return a.using;
			});
		m.type = "use";
		return m;
	};
	return _marker;
}(Z.collisionMarker));