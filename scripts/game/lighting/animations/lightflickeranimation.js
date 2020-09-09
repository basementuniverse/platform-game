Z.lightFlickerAnimation = (function(base) {
	"use strict";
	
	var MIN = 0,
		MAX = 1;
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["ambient", "point", "spot"];
	_animation.rate = 0;					// The flicker rate (seconds)
	_animation.chance = 0;					// The chance that brightness will be changed each time
	_animation.amount = [0, 0];				// The min/max amount by which to reduce brightness
	_animation.time = 0;
	_animation.toggle = false;				// Flickering lights will alternate between initial
											// brightness and randomly reduced brightness
	_animation.initialLightBrightness = 0;
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "flicker";
		a.rate = data.rate || 0;
		a.chance = data.chance || 0;
		a.amount = data.amount || 0;
		a.time = a.rate;
		a.toggle = false;
		a.initialLightBrightness = light.brightness;
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.rate = this.rate;
		data.chance = this.chance;
		data.amount = this.amount;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.time = Math.max(this.time - elapsedTime, 0);
		if (this.time <= 0) {
			this.time = this.rate;
			
			// Subtract a random amount from the initial light brightness (alternate between
			// default brightness and reduced brightness, with random chance of reduced brightness)
			var amount = 0;
			if (this.toggle && Math.random() <= this.chance) {
				amount = Math.randomBetween(this.amount[MIN], this.amount[MAX]);
			}
			this.light.brightness = Math.clamp(this.initialLightBrightness - amount);
			this.toggle = !this.toggle;
		}
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));