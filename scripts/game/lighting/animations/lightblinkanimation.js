Z.lightBlinkAnimation = (function(base) {
	"use strict";
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["ambient", "point", "spot"];
	_animation.rate = 0;						// The blink rate (seconds)
	_animation.pattern = "";					// A string containing the blink pattern where '1'
												// is on and anything else is off
	_animation.time = 0;
	_animation.currentPatternIndex = 0;
	_animation.initialLightBrightness = 0;
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "blink";
		a.rate = data.rate || 0;
		a.pattern = data.pattern || "";
		a.time = a.rate;
		a.currentPatternIndex = 0;
		a.initialLightBrightness = light.brightness;
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.rate = this.rate;
		data.pattern = this.pattern;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.time = Math.max(this.time - elapsedTime, 0);
		if (this.time <= 0) {
			this.time = this.rate;
			
			// Update light brightness according to the current pattern index character
			this.light.brightness = (this.pattern[this.currentPatternIndex] == "1") ?
				this.initialLightBrightness :
				0;
			
			// Loop through the pattern
			this.currentPatternIndex++;
			if (this.currentPatternIndex >= this.pattern.length) {
				this.currentPatternIndex = 0;
			}
		}
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));