Z.forceMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.force = vec2();
	_marker.create = function(data) {
		var m = base.create.call(this, data, null);
		m.type = "force";
		m.force = data.force ? vec2(data.force) : vec2();
		return m;
	};
	_marker.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.force = [this.force.X, this.force.Y];
		return data;
	};
	_marker.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.force = [0, 0];
		return data;
	};
	_marker.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Force
		properties.push({
			name: "Force",
			id: "force",
			type: Z.editorPropertyType.vector,
			normalise: false,
			rangeX: [-50, 50],
			rangeY: [-50, 50]
		});
		return properties;
	};
	_marker.update = function(elapsedTime) {
		base.update.apply(this, arguments);
		if (this.activated) {
			// If an actor that passes the filter criteria is overlapping this entity, apply
			// velocity to the actor
			var actor = null;
			for (var i = Z.game.map.actors.length; i--;) {
				actor = Z.game.map.actors[i];
				
				// Ignore doors, platforms and decorations
				if (
					actor.type == "door" ||
					actor.type == "platform" ||
					actor.type == "decoration"
				) { continue; }
				if (Z.collision.checkActorEntity(actor, this) && this.filter(actor)) {
					actor.velocity = vec2.add(actor.velocity, this.force);
				}
			}
		}
	};
	return _marker;
}(Z.collisionMarker));