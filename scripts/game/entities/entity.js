Z.entity = (function() {
	"use strict";
	
	return {
		itemType: "entity",			// Item type (actor, entity or light)
		id: "",
		type: "",					// The type of constructor to use when creating instances of
									// this entity (should be one of the keys of Z.entityTypes)
		position: vec2(),
		activated: false,
		inputs: [],
		inputIds: [],
		create: function(id, position, inputIds) {
			var e = Object.create(this);
			e.id = id;
			e.position = position;
			e.inputs = [];
			e.inputIds = inputIds || [];
			return e;
		},
		getData: function() {
			return {
				type: this.type,
				id: this.id,
				position: [this.position.X, this.position.Y],
				inputs: this.inputIds
			};
		},
		getEmptyData: function(id, type, position) {
			return {
				id: id,
				type: type,
				position: position
			};
		},
		getEditorProperties: function() {
			return [];
		},
		
		// Activate or deactivate this entity
		setState: function(activated) {
			this.activated = activated;
		},
		update: function(elapsedTime) {
			// Check if all input entities are activated and update state accordingly (entities
			// act like 'and' gates by default)
			var allInputsActivated = true;
			for (var i = this.inputs.length; i--;) {
				if (!this.inputs[i].activated) {
					allInputsActivated = false;
				}
			}
			this.setState(allInputsActivated);
		}
	};
}());