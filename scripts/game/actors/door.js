Z.door = (function(base) {
	"use strict";
	
	var _door = Object.create(base);
	_door.active = true;
	_door.initialPosition = vec2();
	_door.create = function(data) {
		var d = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		d.baseType = "door";
		d.active = !!data.active;
		d.initialPosition = vec2(data.position);
		return d;
	};
	_door.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add door properties if the values are different to the content type values or if
		// the content type doesn't already specify a value
		// Active
		if (
			!Z.content.items[this.type].hasOwnProperty("active") ||
			Z.content.items[this.type].active === null ||
			Z.content.items[this.type].active != this.active
		) {
			data.active = this.active;
		}
		return data;
	};
	_door.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.active = false;
		return data;
	};
	_door.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Active
		properties.push({
			name: "Open",
			id: "active",
			type: Z.editorPropertyType.toggle,
			labelOn: "Closed",
			labelOff: "Open"
		});
		return properties;
	};
	_door.update = function(elapsedTime) {
		// Set animation to idle or active depending on state
		this.sprite.animation = this.active ? "active" : "idle";
		
		// Set obstacle state
		this.collideActors = this.active;
		this.velocity = vec2();
		this.position.X = this.initialPosition.X;
		this.position.Y = this.initialPosition.Y;
		base.update.apply(this, arguments);
	};
	_door.handleCollision = function(actor, translation) { };
	return _door;
}(Z.actor));