Z.decoration = (function(base) {
	"use strict";
	
	var _decoration = Object.create(base);
	_decoration.active = true;
	_decoration.create = function(data) {
		var d = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		d.baseType = "decoration";
		d.useGravity = false;
		d.collideActors = false;
		d.collideTiles = false;
		d.active = !!data.active;
		return d;
	};
	_decoration.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add decoration properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
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
	_decoration.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.active = false;
		return data;
	};
	_decoration.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Active
		properties.push({
			name: "Active",
			id: "active",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_decoration.update = function(elapsedTime) {
		// Set animation to idle or active depending on state
		this.sprite.animation = this.active ? "active" : "idle";
		base.update.apply(this, arguments);
	};
	return _decoration;
}(Z.actor));