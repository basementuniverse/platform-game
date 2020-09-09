Z.lightAnimation = (function() {
	"use strict";
	
	return {
		type: "",
		light: null,
		supportedLightTypes: [],
		create: function(light, data) {
			var l = Object.create(this);
			l.light = light;
			return l;
		},
		getData: function() {
			return {
				type: this.type
			};
		},
		update: function(elapsedTime) { }
	};
}());