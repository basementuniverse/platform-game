Z.actorHealthTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.actorId = "";
	_trigger.comparisonMode = "";
	_trigger.health = 0;
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "actorhealth";
		t.actorId = data.actorId || "";
		t.comparisonMode = data.comparisonMode || "";
		t.health = data.health || 0;
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.actorId = this.actorId;
		data.comparisonMode = this.comparisonMode;
		data.health = this.health;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.actorId = "";
		data.comparisonMode = "equal";
		data.health = 0;
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Actor id
		properties.push({
			name: "Actor",
			id: "actorId",
			type: Z.editorPropertyType.connect,
			typeFilter: [
				"block",
				"character",
				"player"
			]
		});
		
		// Comparison mode
		properties.push({
			name: "Comparison",
			id: "comparisonMode",
			type: Z.editorPropertyType.select,
			options: [
				{
					label: "Equal to",
					value: "equal"
				},
				{
					label: "Less than",
					value: "less"
				},
				{
					label: "More than",
					value: "more"
				}
			]
		});
		
		// Health
		properties.push({
			name: "Health",
			id: "health",
			type: Z.editorPropertyType.number,
			round: true
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		var activated = false,
			currentHealth = Z.game.map.actorsById[this.actorId].health;
		
		// If the target actor has health, check it against the target health level using the
		// comparison mode
		if (currentHealth !== null) {
			switch (this.comparisonMode) {
				case "equal":
					activated = currentHealth == this.health;
					break;
				case "less":
					activated = currentHealth < this.health;
					break;
				case "more":
					activated = currentHealth > this.health;
					break;
				default: break;
			}
		}
		this.activated = activated;
	};
	return _trigger;
}(Z.entity));