Z.cameraShakeTrigger = (function(base) {
	"use strict";
	
	var _trigger = Object.create(base);
	_trigger.amount = 0;
	_trigger.attackTime = 0;
	_trigger.releaseTime = 0;
	_trigger.actualAmount = 0;
	_trigger.fadeAmount = 0;
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "camerashake";
		t.amount = data.amount || 0;
		t.attackTime = data.attackTime || 0;
		t.releaseTime = data.releaseTime || 0;
		t.actualAmount = 0;
		t.fadeAmount = 0;
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.amount = this.amount;
		data.attackTime = this.attackTime;
		data.releaseTime = this.releaseTime;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.amount = 0;
		data.attackTime = 0;
		data.releaseTime = 0;
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Amount
		properties.push({
			name: "Amount",
			id: "amount",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 100,
			round: true
		});
		
		// Attack time
		properties.push({
			name: "Attack Time",
			id: "attackTime",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 10
		});
		
		// Release time
		properties.push({
			name: "Release Time",
			id: "releaseTime",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 10
		});
		return properties;
	};
	_trigger.update = function(elapsedTime) {
		// If activated, increase fade amount towards 1 according to attack time (or jump directly
		// to 1 if attack time is 0)
		if (this.activated) {
			this.fadeAmount = (this.attackTime > 0) ?
				Math.clamp(this.fadeAmount + (elapsedTime / this.attackTime)) :
				1;
		
		// Otherwise, decrease fade amount towards 0 according to release time (or jump directly to
		// 0 if release time is 0)
		} else {
			this.fadeAmount = (this.releaseTime > 0) ?
				Math.clamp(this.fadeAmount - (elapsedTime / this.releaseTime)) :
				0;
		}
		this.actualAmount = this.amount * this.fadeAmount;
		
		// Calculate random camera offset based on shake amount
		Z.camera.offset = vec2.rot(
			vec2(Math.random() * this.actualAmount, 0),
			Math.random() * Math.PI * 2
		);
		base.update.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));