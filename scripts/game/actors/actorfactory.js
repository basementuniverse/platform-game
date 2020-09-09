Z.actorFactory = (function() {
	"use strict";
	
	return {
		// Create a new instance of the specified type and base type of actor
		create: function(data) {
			// Make sure the actor type exists
			if (!Z.content.items[data.type]) {
				console.error("Actor type doesn't exist (%s)", data.type);
				return null;
			}
			
			// Mix type data into instance data
			for (var i in Z.content.items[data.type]) {
				// Instance properties take precedence over type properties
				if (data.hasOwnProperty(i) && data[i] !== null) { continue; }
				data[i] = Z.content.items[data.type][i];
			}
			
			// Make sure the actor base type is valid
			if (!Z.actorTypes[data.baseType]) {
				console.error("Invalid actor base type (%s)", data.baseType);
				return null;
			}
			
			// Return actor instance
			return Z[Z.actorTypes[data.baseType]].create(data);
		}
	};
}());