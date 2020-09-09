Z.particleEmitterTrigger = (function(base) {
	"use strict";
	
	var MIN = 0,
		MAX = 1;
	
	// An array of path modification behaviours - each path modifier returns a function that takes
	// the particle's current velocity, current frame elapsedTime and total life time as arguments
	// and returns a velocity offset that will be added to the particle's current velocity
	var pathModifiers = {
		// Simulates wind by pushing the particle in a particular direction
		//		amount: [0, 0]		The amount of wind per axis (x, y)
		wind: function(data) {
			return function(velocity, elapsedTime, totalTime) {
				return vec2.mul(vec2(data.amount), elapsedTime);
			};
		},
		
		// If the particle is moving downwards, reduce it's y-velocity by amount
		//		amount: 0			The amount by which to reduce downwards velocity (0 -> 1)
		floating: function(data) {
			return function(velocity, elapsedTime, totalTime) {
				if (velocity.Y > 0) {
					return vec2(0, -velocity.Y * data.amount);
				} else {
					return vec2();
				}
			};
		},
		
		// Rotate the particle's movement
		//		angle: 0			The rotation rate (degrees per second)
		rotate: function(data) {
			return function(velocity, elapsedTime, totalTime) {
				var a = Math.radians(data.angle),
					r = vec2.rot(velocity, a * elapsedTime);
				return vec2.sub(r, velocity);
			};
		},
		
		// Move the particle back and forth using the sine function
		//		rate: 0				The oscillation rate (Hz)
		//		amount: [0, 0]		The amount of movement per axis (x, y)
		oscillate: function(data) {
			return function(velocity, elapsedTime, totalTime) {
				return vec2.mul(vec2(data.amount), Math.sin(totalTime * data.rate * Math.PI * 2));
			};
		}
	};
	
	// Create random particles within the specified emitter's bounding box
	var createParticles = function(
		topLeft,
		bottomRight,
		particleType,
		amount,
		speed,
		angle,
		alpha,
		timeout,
		compositeMode,
		useGravity,
		collide,
		pathModifierFunctions
	) {
		// Make sure the particle type exists
		if (!Z.content.items[particleType]) { return; }
		
		// Create a random number of particles (always create at least 1)
		var count = Math.randomIntBetween(amount[MIN], amount[MAX]),
			position = vec2(),
			velocity = vec2(),
			angleRadians = [Math.radians(angle[MIN] - 90), Math.radians(angle[MAX] - 90)],
			randomAlpha = 0,
			randomTimeout = 0;
		for (var i = 0; i < count; i++) {
			// Random position within emitter bounds
			position = vec2(
				Math.randomIntBetween(topLeft.X, bottomRight.X),
				Math.randomIntBetween(topLeft.Y, bottomRight.Y)
			);
			
			// Random velocity
			velocity = vec2.rot(
				vec2(Math.randomBetween(speed[MIN], speed[MAX]), 0),
				Math.randomBetween(angleRadians[MIN], angleRadians[MAX])
			);
			
			// Random alpha
			randomAlpha = Math.randomBetween(Math.clamp(alpha[MIN]), Math.clamp(alpha[MAX]));
			
			// Random timeout
			randomTimeout = Math.randomBetween(timeout[MIN], timeout[MAX]);
			
			// Create particle
			Z.game.map.actors.push(Z.particle.create(
				position,
				velocity,
				pathModifierFunctions,
				randomAlpha,
				randomTimeout,
				compositeMode,
				useGravity,
				collide,
				Z.content.items[particleType]
			));
		}
	};
	
	var _trigger = Object.create(base);
	_trigger.size = vec2();			// The area in which particles should be created
	_trigger.continuous = false;	// True if particles should be continuously created while this
									// entity is activated, otherwise particles will only be
									// created once when the entity changes to activated
	_trigger.particleType = "";		// The type of particle to create (ie. the content id)
	_trigger.rate = 0;				// The particle creation rate, in seconds
	_trigger.createTime = 0;		// The amount of time until the next particle should be created
	_trigger.chance = 0;			// The chance that particles will be created
	_trigger.amount = [0, 0];		// The min/max number of random particles to create
	_trigger.speed = [0, 0];		// The min/max random particle movement speed
	_trigger.angle = [0, 0];		// The min/max random particle movement angle (degrees)
	_trigger.alpha = [0, 0];		// The min/max alpha to use when drawing particles
	_trigger.timeout = [0, 0];		// The min/max random timeout period for particles, in seconds
	_trigger.compositeMode = "";	// The composite operation to use when drawing particles
	_trigger.useGravity = false;	// True if particles should be gravity-enabled
	_trigger.collide = false;		// True if particles should collide with tiles
	_trigger.pathModifiers = [];	// A list of path modifiers with modifier id and arguments
	_trigger.pathModifierFunctions = [];	// A list of path modification functions
	_trigger.create = function(data) {
		var t = base.create.call(this, data.id, vec2(data.position), data.inputs);
		t.type = "particle";
		t.size = vec2(data.size);
		t.continuous = !!data.continuous;
		t.particleType = data.particleType || "";
		t.rate = data.rate || 0;
		t.createTime = 0;
		t.chance = data.chance || 0;
		t.amount = data.amount || [0, 0];
		t.speed = data.speed || [0, 0];
		t.angle = data.angle || [0, 0];
		t.alpha = data.alpha || [0, 0];
		t.timeout = data.timeout || [0, 0];
		t.compositeMode = data.compositeMode || "";
		t.useGravity = !!data.useGravity;
		t.collide = !!data.collide;
		t.pathModifiers = data.pathModifiers || [];
		
		// Get a list of path modification functions
		var modifiers = [];
		for (var i = 0, length = t.pathModifiers.length; i < length; i++) {
			if (t.pathModifiers[i].id && pathModifiers[t.pathModifiers[i].id]) {
				modifiers.push(
					pathModifiers[t.pathModifiers[i].id](t.pathModifiers[i])
				);
			}
		}
		t.pathModifierFunctions = modifiers;
		return t;
	};
	_trigger.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.size = [this.size.X, this.size.Y];
		data.continuous = this.continuous;
		data.particleType = this.particleType;
		data.rate = this.rate;
		data.chance = this.chance;
		data.amount = this.amount;
		data.speed = this.speed;
		data.angle = this.angle;
		data.alpha = this.alpha;
		data.timeout = this.timeout;
		data.compositeMode = this.compositeMode;
		data.useGravity = this.useGravity;
		data.collide = this.collide;
		data.pathModifiers = this.pathModifiers;
		return data;
	};
	_trigger.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.size = [10, 10];
		data.continuous = false;
		data.particleType = "";
		data.rate = 0;
		data.chance = 0;
		data.amount = [0, 0];
		data.speed = [0, 0];
		data.angle = [0, 0];
		data.alpha = [0, 0];
		data.timeout = [0, 0];
		data.compositeMode = "";
		data.useGravity = false;
		data.collide = false;
		data.pathModifiers = [];
		return data;
	};
	_trigger.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Continuous
		properties.push({
			name: "Continuous",
			id: "continuous",
			type: Z.editorPropertyType.toggle
		});
		
		// Particle type
		var particleTypes = [];
		for (var i in Z.content.items) {
			if (
				Z.content.items.hasOwnProperty(i) &&
				Z.content.items[i].baseType == "particle"
			) {
				particleTypes.push({
					label: Z.content.items[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Particle Type",
			id: "particleType",
			type: Z.editorPropertyType.select,
			options: particleTypes
		});
		
		// Rate
		properties.push({
			name: "Rate",
			id: "rate",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 30
		});
		
		// Chance
		properties.push({
			name: "Chance",
			id: "chance",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 1
		});
		
		// Amount
		properties.push({
			name: "Amount",
			id: "amount",
			type: Z.editorPropertyType.range,
			min: 0,
			max: 50,
			round: true
		});
		
		// Speed
		properties.push({
			name: "Speed",
			id: "speed",
			type: Z.editorPropertyType.range,
			min: 0,
			max: 50,
			round: true
		});
		
		// Angle
		properties.push({
			name: "Minimum Angle",
			id: "angle",
			index: 0,
			type: Z.editorPropertyType.direction,
			output: Z.directionControlOutputType.radians
		});
		properties.push({
			name: "Maximum Angle",
			id: "angle",
			index: 1,
			type: Z.editorPropertyType.direction,
			output: Z.directionControlOutputType.radians
		});
		
		// Alpha
		properties.push({
			name: "Alpha",
			id: "alpha",
			type: Z.editorPropertyType.range,
			min: 0,
			max: 1
		});
		
		// Timeout
		properties.push({
			name: "Timeout",
			id: "timeout",
			type: Z.editorPropertyType.range,
			min: 0,
			max: 30
		});
		
		// Composite mode
		properties.push({
			name: "Composite Mode",
			id: "compositeMode",
			type: Z.editorPropertyType.select,
			options: [
				{
					label: "Normal",
					value: ""
				},
				{
					label: "Multiply",
					value: "multiply"
				},
				{
					label: "Screen",
					value: "screen"
				},
				{
					label: "Overlay",
					value: "overlay"
				},
				{
					label: "Darken",
					value: "darken"
				},
				{
					label: "Lighten",
					value: "lighten"
				},
				{
					label: "Colour Dodge",
					value: "color-dodge"
				},
				{
					label: "Colour Burn",
					value: "color-burn"
				},
				{
					label: "Hard Light",
					value: "hard-light"
				},
				{
					label: "Soft Light",
					value: "soft-light"
				},
				{
					label: "Difference",
					value: "difference"
				},
				{
					label: "Exclusion",
					value: "exclusion"
				},
				{
					label: "Hue",
					value: "hue"
				},
				{
					label: "Saturation",
					value: "saturation"
				},
				{
					label: "Colour",
					value: "color"
				},
				{
					label: "Luminosity",
					value: "luminosity"
				}
			]
		});
		
		// Use gravity
		properties.push({
			name: "Gravity",
			id: "useGravity",
			type: Z.editorPropertyType.toggle
		});
		
		// Collide
		properties.push({
			name: "Collide",
			id: "collide",
			type: Z.editorPropertyType.toggle
		});
		
		// Path modifiers
		properties.push({
			name: "Path Modifiers",
			id: "pathModifiers",
			type: Z.editorPropertyType.custom
		});
		return properties;
	};
	_trigger.setState = function(activated) {
		// If this emitter is non-continuous, only create particles when changing state from
		// deactivated to activated
		if (!this.continuous && !this.activated && activated) {
			createParticles(
				this.position,
				vec2.add(this.position, this.size),
				this.particleType,
				this.amount,
				this.speed,
				this.angle,
				this.alpha,
				this.timeout,
				this.compositeMode,
				this.useGravity,
				this.collide,
				this.pathModifierFunctions
			);
		}
		base.setState.apply(this, arguments);
	};
	_trigger.update = function(elapsedTime) {
		// If this emitter is continuous, create particles while activated
		if (this.continuous && this.activated) {
			this.createTime = Math.max(this.createTime - elapsedTime, 0);
			if (this.createTime <= 0) {
				this.createTime = this.rate;
				
				// Random chance of creating particles
				if (Math.random() <= this.chance) {
					createParticles(
						this.position,
						vec2.add(this.position, this.size),
						this.particleType,
						this.amount,
						this.speed,
						this.angle,
						this.alpha,
						this.timeout,
						this.compositeMode,
						this.useGravity,
						this.collide,
						this.pathModifierFunctions
					);
				}
			}
		}
		base.update.apply(this, arguments);
	};
	return _trigger;
}(Z.entity));