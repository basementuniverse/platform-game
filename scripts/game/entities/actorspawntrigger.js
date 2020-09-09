Z.actorSpawnTrigger = (function(base) {
	"use strict";
	
	// Create an actor instance using the specified actor data with a unique sequential id
	var createActor = function(type, position) {
		// Generate a unique sequential id
		var n = 0,
			actor = null,
			data = null;
		while (Z.game.map.actorsById[type + ++n]) {}
		
		// Create actor data
		data = {
			id: type + n,
			type: type,
			position: [position.X, position.Y]
		};
		
		// Create an actor instance and add it to the current map
		actor = Z.actorFactory.create(data);
		Z.game.map.actors.push(actor);
		Z.game.map.actorsById[actor.id] = actor;
	};
	
	var _trigger = Object.create(base);
	_trigger.actorType = "";
	_trigger.continuous = false;
	_trigger.rate = 0;
	_trigger.lastSpawnTime = 0;
	_trigger.latch = false;
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "actorspawn";
		t.actorType = data.actorType || null;
		t.continuous = !!data.continuous;
		t.rate = data.rate || 0;
		t.lastSpawnTime = 0;
		t.latch = false;
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.actorType = this.actorType;
		data.continuous = this.continuous;
		data.rate = this.rate;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.actorType = "";
		data.continuous = false;
		data.rate = 0;
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Actor type
		var actorTypes = [];
		for (var i in Z.content.items) {
			if (
				Z.content.items.hasOwnProperty(i) &&
				Z.content.items[i].baseType == "actor"
			) {
				actorTypes.push({
					label: Z.content.items[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Actor Type",
			id: "actorType",
			type: Z.editorPropertyType.select,
			options: actorTypes
		});
		
		// Continuous
		properties.push({
			name: "Continuous",
			id: "continuous",
			type: Z.editorPropertyType.toggle
		});
		
		// Rate
		properties.push({
			name: "Rate",
			id: "rate",
			type: Z.editorPropertyType.number,
			min: 1,
			max: 30,
			round: true
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		if (this.activated) {
			// If this spawner is continuous, keep creating new actors according to the spawn rate
			if (this.continuous) {
				this.lastSpawnTime = Math.max(this.lastSpawnTime - elapsedTime, 0);
				if (this.lastSpawnTime <= 0) {
					createActor(this.actorType, this.position);
					this.lastSpawnTime = this.rate;
				}
			
			// Otherwise, create a new actor and set the latch (so only one actor is created when
			// changing from deactivated to activated)
			} else if (!this.latch) {
				createActor(this.actorType, this.position);
				this.latch = true;
			}
		} else {
			this.latch = false;		// Reset latch when deactivated
		}
		base.update.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));