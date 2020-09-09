Z.light = (function() {
	"use strict";
	
	return {
		itemType: "light",			// Item type (actor, entity or light)
		canvas: null,
		context: null,
		type: "",					// The type of constructor to use when creating instances of
									// this light (should be one of the keys of Z.lightTypes)
		id: "",
		brightness: 0,
		colour: "",
		castShadows: false,
		active: true,
		animations: [],
		
		// Create and return a new light object
		//	type:			The type of light
		//	id:				The light id (so that entities/actors can reference the light, optional)
		//	brightness:		The light brightness
		//	colour:			The colour of the light
		//	castShadows:	True if this light casts tile shadows
		//	active:			True if this light is initially activated
		//	animations:		A list of animations data
		create: function(type, id, brightness, colour, castShadows, active, animations) {
			var l = Object.create(this);
			l.type = type;
			l.id = id;
			l.brightness = brightness || 0;
			l.colour = colour || "white";
			l.castShadows = !!castShadows;
			l.active = !!active;
			
			// Create light canvas and get context
			l.canvas = document.createElement("canvas");
			l.context = l.canvas.getContext("2d");
			
			// Create light animation instances if this light has any animations
			l.animations = [];
			if (animations && animations.length) {
				var animation = null;
				for (var i = 0, length = animations.length; i < length; i++) {
					if (animation = Z.lightAnimationFactory.create(l, animations[i])) {
						l.animations.push(animation);
					}
				}
			}
			return l;
		},
		getData: function() {
			// Get animation data for this light
			var animations = [];
			for (var i = 0, length = this.animations.length; i < length; i++) {
				animations.push(this.animations[i].getData());
			}
			return {
				type: this.type,
				id: this.id,
				brightness: this.brightness,
				colour: this.colour,
				castShadows: this.castShadows,
				active: this.active,
				animations: animations
			};
		},
		getEmptyData: function(id, type, position) {
			return {
				id: id,
				type: type,
				position: position,
				brightness: 1,
				colour: "rgba(255, 255, 255, 1)",
				castShadows: false,
				active: true,
				animations: []
			};
		},
		getEditorProperties: function() {
			var properties = [];
			
			// Brightness
			properties.push({
				name: "Brightness",
				id: "brightness",
				type: Z.editorPropertyType.number,
				min: 0,
				max: 1
			});
			
			// Colour
			properties.push({
				name: "Brightness",
				id: "brightness",
				type: Z.editorPropertyType.colour
			});
			
			// Cast shadows
			properties.push({
				name: "Cast Shadows",
				id: "castShadows",
				type: Z.editorPropertyType.toggle
			});
			
			// Active
			properties.push({
				name: "Initial State",
				id: "active",
				type: Z.editorPropertyType.toggle,
				labelOn: "On",
				labelOff: "Off"
			});
			
			// Animations
			properties.push({
				name: "Animations",
				id: "animations",
				type: Z.editorPropertyType.custom
			});
			return properties;
		},
		update: function(elapsedTime) {
			// Update light animations if this light is active
			if (this.active) {
				for (var i = this.animations.length; i--;) {
					this.animations[i].update(elapsedTime);
				}
			}
		},
		draw: function(lightContext) { }
	};
}());