Z.lightRotateAnimation = (function(base) {
	"use strict";
	
	var _animation = Object.create(base);
	_animation.supportedLightTypes = ["ambient", "spot"];
	_animation.speed = 0;			// The rotation speed (degrees per second)
	_animation.startAngle = 0;		// The starting angle (degrees)
	_animation.endAngle = 0;		// The ending angle (degrees)
	_animation.reverse = false;		// If true, reverse direction when ending angle is reached
									// otherwise reset back to starting angle
	_animation.angle = 0;			// The current angle (degrees)
	_animation.direction = vec2();	// The current direction vector
	_animation.create = function(light, data) {
		var a = base.create.call(this, light, data);
		a.type = "rotate";
		a.speed = data.speed || 0;
		a.startAngle = data.startAngle || 0;
		a.endAngle = data.endAngle || 0;
		a.reverse = !!data.reverse;
		
		// Initialise direction to starting angle
		a.angle = Math.radians(a.startAngle);
		a.direction = vec2();
		return a;
	};
	_animation.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.speed = this.speed;
		data.startAngle = this.startAngle;
		data.endAngle = this.endAngle;
		data.reverse = this.reverse;
		return data;
	};
	_animation.update = function(elapsedTime) {
		this.angle = (this.angle + this.speed * elapsedTime) % 360;
		
		// Reverse direction if the end/start angle has been reached
		var start = Math.min(this.startAngle, this.endAngle),
			end = Math.max(this.startAngle, this.endAngle);
		if (this.reverse) {
			if (this.angle < start || this.angle > end) {
				this.speed *= -1;
			}
		} else {
			if (this.angle < start) {
				this.angle = end;
			} else if (this.angle > end) {
				this.angle = start;
			}
		}
		
		// Calculate light direction
		this.angle = Math.clamp(this.angle, start, end);
		this.direction = vec2.rot(vec2(1, 0), Math.radians(this.angle));
		this.light.direction = this.direction;
		base.update.apply(this, arguments);
	};
	return _animation;
}(Z.lightAnimation));