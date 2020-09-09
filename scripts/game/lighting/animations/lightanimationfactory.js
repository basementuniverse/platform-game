Z.lightAnimationFactory = (function() {
	"use strict";
	
	return {
		create: function(light, data) {
			// Make sure the light animation type is valid
			if (!Z.lightAnimationTypes[data.type]) {
				console.error("Invalid light animation type (%s)", data.type);
				return null;
			}
			
			// Make sure the light type supports the specified animation type
			if (Z[Z.lightAnimationTypes[data.type]].supportedLightTypes.indexOf(light.type) == -1) {
				return null;
			}
			
			// Return light animation instance
			return Z[Z.lightAnimationTypes[data.type]].create(light, data);
		}
	};
}());