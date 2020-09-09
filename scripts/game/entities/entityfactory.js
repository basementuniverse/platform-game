Z.entityFactory = (function() {
	"use strict";
	
	return {
		create: function(data) {
			// Make sure the entity type is valid
			if (!Z.entityTypes[data.type]) {
				console.error("Invalid entity type (%s)", data.type);
				return null;
			}
			
			// Return entity instance
			return Z[Z.entityTypes[data.type]].create(data);
		}
	};
}());