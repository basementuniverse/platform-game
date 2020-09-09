Z.lightFlashAnimation = (function(base) {
	"use strict";
	
	var MIN = 0,
		MAX = 1;
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["ambient", "point", "spot"];
	_animation.rate = 0;				// The flash rate (seconds)
	_animation.chance = 0;				// The chance that the light will flash each time
	_animation.flashTime = [0, 0];		// The min/max flash duration (seconds)
	_animation.amount = [0, 0];			// The min/max amount by which to increase brightness
	_animation.colour = "";				// The colour to change to when flashing
	_animation.time = 0;
	_animation.flashing = false;
	_animation.initialLightBrightness = 0;
	_animation.initialLightColour = "";
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "flash";
		a.rate = data.rate || 0;
		a.chance = data.chance || 0;
		a.flashTime = data.flashTime || 0;
		a.amount = data.amount || 0;
		a.colour = data.colour || "white";
		a.time = a.rate;
		a.flashing = false;
		a.initialLightBrightness = light.brightness;
		a.initialLightColour = light.colour;
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.rate = this.rate;
		data.chance = this.chance;
		data.flashTime = this.flashTime;
		data.amount = this.amount;
		data.colour = this.colour;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.time = Math.max(this.time - elapsedTime, 0);
		if (this.time <= 0) {
			this.time = this.rate;
			
			// If light is currently flashing, reset light back to default brightness and colour
			if (this.flashing) {
				this.flashing = false;
				this.light.brightness = this.initialLightBrightness;
				this.light.colour = this.initialLightColour;
			
			// Otherwise, randomly flash the light on and set the timer to a random flash duration
			} else if (Math.random() <= this.chance) {
				this.flashing = true;
				
				// Increase the light brightness by a random amount
				var amount = Math.randomBetween(this.amount[MIN], this.amount[MAX]);
				this.light.brightness = Math.clamp(this.initialLightBrightness + amount);
				this.light.colour = this.colour;
				
				// Calculate random flash duration
				this.time = Math.randomBetween(this.flashTime[MIN], this.flashTime[MAX]);
			}
		}
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));