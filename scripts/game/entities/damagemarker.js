Z.damageMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.amount = 0;
	_marker.kill = false;
	_marker.create = function(data) {
		var m = base.create.call(this, data, null);
		m.type = "damage";
		m.amount = data.amount || 0;
		m.kill = !!data.kill;
		return m;
	};
	_marker.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.amount = this.amount;
		data.kill = this.kill;
		return data;
	};
	_marker.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.amount = 0;
		data.kill = false;
		return data;
	};
	_marker.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Amount
		properties.push({
			name: "Damage",
			id: "amount",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 5,
			round: true
		});
		
		// Kill
		properties.push({
			name: "Kill Instantly",
			id: "kill",
			type: Z.editorPropertyType.toggle
		});
		return properties;
	};
	_marker.update = function(elapsedTime) {
		base.update.apply(this, arguments);
		if (this.activated) {
			// If a damageable actor that passes the filter criteria is overlapping this entity,
			// apply damage to the actor (or kill the actor immediately if this option is set)
			var actor = null;
			for (var i = Z.game.map.actors.length; i--;) {
				actor = Z.game.map.actors[i];
				
				// Ignore actor if it isn't damageable and killable
				if (!actor.damage && !actor.die) { continue; }
				if (Z.collision.checkActorEntity(actor, this) && this.filter(actor)) {
					if (this.kill) {
						actor.die();
					} else {
						actor.damage(this.amount);
					}
				}
			}
		}
	};
	return _marker;
}(Z.collisionMarker));