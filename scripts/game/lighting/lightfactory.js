Z.lightFactory = (function() {
	"use strict";
	
	return {
		create: function(data) {
			// Make sure the light type is valid
			if (!Z.lightTypes[data.type]) {
				console.error("Invalid light type (%s)", data.type);
				return null;
			}
			
			// Return light instance
			return Z[Z.lightTypes[data.type]].create(data);
		}
	};
}());