Z.collisionMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.size = vec2();
	_marker.filter = null;
	_marker.filterType = "";
	_marker.filterId = "";
	_marker.create = function(data, filter) {
		var m = base.create.call(this, data.id, vec2(data.position), data.inputs);
		m.type = "collision";
		m.size = vec2(data.size);
		
		// Initialise filter
		m.filterType = data.filterType || "";
		m.filterId = data.filterId || "";
		m.filter = function(a) {
			// If actor is player and player is dead, don't activate
			if (a.type == "player" && !a.alive) { return false; }
			return (
				(!data.filterType || a.type == data.filterType) &&
				(!data.filterId || a.id == data.filterId) &&
				(!filter || filter(a))
			);
		};
		return m;
	};
	_marker.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.size = [this.size.X, this.size.Y];
		data.filterType = this.filterType;
		data.filterId = this.filterId;
		return data;
	};
	_marker.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.size = [10, 10];
		data.filterType = "";
		data.filterId = "";
		return data;
	};
	_marker.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Filter type
		properties.push({
			name: "Actor Type",
			id: "filterType",
			type: Z.editorPropertyType.select,
			options: [
				{
					label: "Any actor",
					value: ""
				},
				{
					label: "Block",
					value: "block"
				},
				{
					label: "Character",
					value: "character"
				},
				{
					label: "Decoration",
					value: "decoration"
				},
				{
					label: "Door",
					value: "door"
				},
				{
					label: "Particle",
					value: "particle"
				},
				{
					label: "Platform",
					value: "platform"
				},
				{
					label: "Player",
					value: "player"
				},
				{
					label: "Projectile",
					value: "projectile"
				}
			]
		});
		
		// Filter id
		properties.push({
			name: "Actor Id",
			id: "filterId",
			type: Z.editorPropertyType.custom
		});
		return properties;
	};
	_marker.update = function(elapsedTime) {
		base.update.apply(this, arguments);
		
		// This type of entity is activated if all inputs are active and there are overlapping
		// actors that pass the filter criteria
		var overlapping = false,
			actor = null;
		for (var i = Z.game.map.actors.length; i--;) {
			actor = Z.game.map.actors[i];
			if (Z.collision.checkActorEntity(actor, this) && this.filter(actor)) {
				overlapping = true;
			}
		}
		this.setState(this.activated && overlapping);
	};
	return _marker;
}(Z.entity));