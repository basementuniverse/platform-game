Z.lightJitterAnimation = (function(base) {
	"use strict";
	
	var EASE_AMOUNT = 0.04;						// Ease movement
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["point", "spot"];
	_animation.rate = 0;						// The jitter rate (seconds)
	_animation.amount = 0;						// The amount of movement (pixels)
	_animation.time = 0;
	_animation.offset = vec2();
	_animation.actualOffset = vec2();
	_animation.initialLightPosition = vec2();
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "jitter";
		a.rate = data.rate || 0;
		a.amount = data.amount || 0;
		a.time = a.rate;
		a.offset = vec2();
		a.actualOffset = vec2();
		a.initialLightPosition = vec2(light.position);
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.rate = this.rate;
		data.amount = this.amount;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.time = Math.max(this.time - elapsedTime, 0);
		if (this.time <= 0) {
			this.time = this.rate;
			
			// Calculate new random offset
			this.offset = vec2(
				Math.randomBetween(-this.amount, this.amount),
				Math.randomBetween(-this.amount, this.amount)
			);
		}
		
		// Ease towards offset
		var offsetDelta = vec2.sub(this.offset, this.actualOffset);
		this.actualOffset = vec2.add(this.actualOffset, vec2.mul(offsetDelta, EASE_AMOUNT));
		
		// Offset light position
		this.light.position = vec2.add(this.initialLightPosition, this.actualOffset);
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));