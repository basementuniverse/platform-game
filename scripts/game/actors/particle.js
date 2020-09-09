Z.particle = (function(base) {
	"use strict";
	
	var _particle = Object.create(base);
	_particle.pathModifiers = [];
	_particle.alpha = 0;
	_particle.timeout = 0;
	_particle.totalTime = 0;
	_particle.compositeMode = "";
	_particle.create = function(
		position,		// The initial position of the particle
		velocity,		// The particle velocity
		pathModifiers,	// A list of functions that modify the particle velocity, each function
						// should take the current velocity, current frame elapsedTime and the
						// particle's total lifetime as arguments and return a vector that will be
						// added to the particle's current velocity
		alpha,			// The particle opacity
		timeout,		// The particle lifetime, in seconds
		compositeMode,	// The composite operation to use when drawing the particle
		useGravity,		// True if the particle should be gravity-enabled
		collide,		// True if the particle should collide with tiles
		data			// Particle content data
	) {
		var p = base.create.call(
				this,
				"particle",
				"particle",
				data.name,
				position,
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		p.baseType = "particle";
		p.velocity = velocity;
		p.pathModifiers = pathModifiers;
		p.alpha = alpha;
		p.timeout = timeout;
		p.totalTime = 0;
		p.compositeMode = compositeMode || "source-over";	// Default to source-over operation
		p.useGravity = useGravity;
		p.collideActors = false;		// Don't collide with other actors
		p.collideTiles = collide;
		
		// Play fade in animation when created, then change to idle animation
		p.sprite.animations["fadein"].finishedCallback = function() {
			p.sprite.animation = "idle";
		};
		p.sprite.animation = "fadein";
		
		// Remove sprite after fade out animation is finished
		p.sprite.animations["fadeout"].finishedCallback = function() {
			p.disposed = true;
		};
		return p;
	};
	_particle.update = function(elapsedTime) {
		this.totalTime += elapsedTime;
		
		// Play fade out animation when this particle times out
		this.timeout = Math.max(this.timeout - elapsedTime, 0);
		if (this.timeout <= 0) {
			this.sprite.animation = "fadeout";
		}
		
		// Apply path modifiers
		for (var i = 0, length = this.pathModifiers.length; i < length; i++) {
			this.velocity = vec2.add(
				this.velocity,
				this.pathModifiers[i](this.velocity, elapsedTime, this.totalTime)
			);
		}
		base.update.apply(this, arguments);
	};
	_particle.draw = function(context) {
		context.save();
		context.globalAlpha = this.alpha;
		context.globalCompositeOperation = this.compositeMode;
		base.draw.apply(this, arguments);
		context.restore();
	};
	return _particle;
}(Z.actor));