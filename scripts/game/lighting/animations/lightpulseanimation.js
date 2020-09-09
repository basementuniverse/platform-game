Z.lightPulseAnimation = (function(base) {
	"use strict";
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["ambient", "point", "spot"];
	_animation.frequency = 0;	// The pulse frequency (Hz)
	_animation.amount = 0;		// The amount by which to increase/decrease the brightness
	_animation.time = 0;
	_animation.initialLightBrightness = 0;
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "pulse";
		a.frequency = data.frequency || 0;
		a.amount = data.amount || 0;
		a.time = 0;
		a.initialLightBrightness = light.brightness;
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.frequency = this.frequency;
		data.amount = this.amount;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.time += elapsedTime;
		
		// Calculate pulse amount
		var amount = Math.sin(this.time * this.frequency * Math.PI * 2) * this.amount;
		this.light.brightness = Math.clamp(this.initialLightBrightness + amount);
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));