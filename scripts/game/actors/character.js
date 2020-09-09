Z.character = (function(base) {
	"use strict";
	
	var INVISIBLE_ALPHA = 0.3,				// Alpha level when invisible
		DIE_JUMP_STRENGTH = 7.5,			// Jump strength for death animation
		DAMAGE_INVULNERABLE_RATE = 3.5,		// Alpha oscillation rate while invulnerable (hz)
		DAMAGE_INVULNERABLE_AMOUNT = 0.3,	// Minimum alpha while invulnerable
		OBSTACLE_OFFSET = 5,				// Offset when checking for tile obstacles/gaps
		PROXIMITY_DISTANCE = 50;			// The distance at which to trigger the player
											// proximity event
	
	// Set a property in the specified character data if it doesn't already exist in the
	// character's content definition or if it is different to the content definition's value
	var set = function(character, data, property) {
		if (
			!Z.content.items[character.type].hasOwnProperty(property) ||
			Z.content.items[character.type][property] === null ||
			Z.content.items[character.type][property] != character[property]
		) {
			data[property] = character[property];
		}
	};
	
	// Return true if there is a tile blocking the character's in the current movement direction
	var checkObstacle = function(character, map) {
		// If the character is not currently moving, assume there are no obstacles
		if (!character.moveVector.X && !character.moveVector.Y) { return false; }
		
		// Get two corner points (offset inwards by OBSTACLE_OFFSET)
		var p1 = null,
			p2 = null,
			check = null;
		if (character.moveVector.X > 0) {
			p1 = vec2(character.size.X + OBSTACLE_OFFSET, OBSTACLE_OFFSET);
			p2 = vec2(character.size.X + OBSTACLE_OFFSET, character.size.Y - OBSTACLE_OFFSET);
			check = function(t) { return t.solid || t.leftEdge; }
		} else if (character.moveVector.X < 0) {
			p1 = vec2(-OBSTACLE_OFFSET, OBSTACLE_OFFSET);
			p2 = vec2(-OBSTACLE_OFFSET, character.size.Y - OBSTACLE_OFFSET);
			check = function(t) { return t.solid || t.rightEdge; }
		} else if (character.moveVector.Y > 0) {
			p1 = vec2(character.size.X - OBSTACLE_OFFSET, character.size.Y + OBSTACLE_OFFSET);
			p2 = vec2(OBSTACLE_OFFSET, character.size.Y + OBSTACLE_OFFSET);
			check = function(t) { return t.solid || t.topEdge; }
		} else if (character.moveVector.Y < 0) {
			p1 = vec2(OBSTACLE_OFFSET, -OBSTACLE_OFFSET);
			p2 = vec2(character.size.X - OBSTACLE_OFFSET, -OBSTACLE_OFFSET);
			check = function(t) { return t.solid || t.bottomEdge; }
		}
		p1 = vec2.add(character.position, p1);
		p2 = vec2.add(character.position, p2);
		
		// Check each point against the map
		return (
			Z.collision.checkPoint(p1, Z.game.map, check) ||
			Z.collision.checkPoint(p2, Z.game.map, check)
		);
	};
	
	// Return true if there is a gap in the floor in the character's current movement direction
	var checkGap = function(character, map) {
		// If the character is flying or is not currently moving along the x-axis, assume there
		// are no gaps
		if (character.flying || !character.moveVector.X) { return false; }
		
		// Get a point offset from the character's leading edge (offset into the floor)
		var p = null,
			check = function(t) { return t.solid || t.topEdge; };
		if (character.moveVector.X > 0) {
			p = vec2(character.size.X + OBSTACLE_OFFSET, character.size.Y + OBSTACLE_OFFSET);
		} else {
			p = vec2(-OBSTACLE_OFFSET, character.size.Y + OBSTACLE_OFFSET);
		}
		p = vec2.add(character.position, p);
		
		// Check this point against the map
		return !Z.collision.checkPoint(p, Z.game.map, check);
	};
	
	// Return true if the player is currently visible
	var checkPlayerVisibility = function(character, player, map) {
		// If the player is invisible, the player cannot be seen
		if (player.invisible) { return false; }
		
		// If this character has no vision, the player cannot be seen
		if (character.visionType == Z.characterVisionType.none) { return false; }
		
		// Make sure the player is within visual range of the character, depending on vision type
		// Horizontal vision
		if (
			character.visionType == Z.characterVisionType.horizontal &&
			(	// Check if player y-projection doesn't overlap character y-projection
				(player.position.Y + player.size.Y) < character.position.Y ||
				player.position.Y > (character.position.Y + character.size.Y)
			)
		) { return false; }
		
		// Vertical vision
		if (
			character.visionType == Z.characterVisionType.vertical &&
			(	// Check if player x-projection doesn't overlap character x-projection
				(player.position.X + player.size.X) < character.position.X ||
				player.position.X > (character.position.X + character.size.X)
			)
		) { return false; }
		
		// Directional vision
		if (
			character.visionType == Z.characterVisionType.directional &&
			(	// Check if player y-projection doesn't overlap character y-projection
				(player.position.Y + player.size.Y) < character.position.Y ||
				player.position.Y > (character.position.Y + character.size.Y)
			) ||
			(	// Check player is on the non-facing side of the character
				(character.direction.X > 0 && player.position.X < character.position.X) ||
				(character.direction.X < 0 && player.position.X > character.position.X)
			)
		) { return false; }
		
		// Player is standing within visual range, so check line of sight
		return !Z.collision.checkLine(character.position, Z.player.position, Z.game.map);
	};
	
	var _character = Object.create(base);
	
	// Event latches
	_character.playerVisibleEvent = false;
	_character.playerProximityEvent = false;
	_character.playerCollided = false;		// Collided with player this frame
	_character.playerCollideEvent = false;
	_character.tileEventDistance = 0;		// Distance since last tile event (obstacle or gap)
	_character.activatedEvent = false;
	_character.liquidEvent = false;
	
	// Character properties
	_character.active = false;				// True if this actor is currently activated
	_character.speed = 0;					// Acceleration in x-axis
	_character.maxSpeed = 0;				// Maximum x-axis movement speed
	_character.jumpStrength = 0;			// Jump velocity amount
	_character.health = 0;					// Current/initial health
	_character.maxHealth = 0;				// Maximum number of health points
	_character.regenerateHealth = false;	// Immediately set health to maximum when damaged
	_character.alive = true;				// True if this character is currently alive
	_character.damageTime = 0;				// Damage invulnerability timer
	_character.damageInvulnerableTime = 0;	// When damaged, character becomes invulnerable for this
											// amount of time (seconds)
	_character.moveVector = vec2();			// Requested movement for this frame
	_character.jumped = false;				// Just started jumping (need to apply jump velocity)
	_character.jumping = false;				// Currently in a jump
	_character.firing = false;				// Currently firing weapon
	_character.projectileType = "";			// This character's projectile content type
	_character.rateOfFire = 0;				// Rate of fire for semi-automatic firing
	_character.rateOfFireTimer = 0;			// Rate of fire countdown timer
	_character.flying = false;				// Can this character fly
	_character.invisible = false;			// Is this character currently invisible
	_character.invulnerable = false;		// Is this character currently invulnerable
	_character.powerAttack = false;			// Projectiles do more damage when this is active
	_character.waterBreathing = false;		// True if this character can breathe underwater
	_character.oxygen = 0;					// The current oxygen level (depleted while underwater)
	_character.maxOxygen = 0;				// The maximum oxygen level
	_character.canBreathe = true;			// True if this character can currently breathe
	_character.breatheTime = 0;				// Breathing timer (for depleting oxygen underwater)
	_character.breatheRate = 0;				// Oxygen will be depleted at this rate (seconds)
	_character.touchDamage = 0;				// Amount of damage to deal to player when touched
	_character.touchKill = false;			// Kill the player immediately when touched
	_character.visionType = Z.characterVisionType.none;	// The character's visual range
	_character.currentState = "";			// This character's current AI state
	_character.previousState = "";			// This character's previous AI state
	_character.states = [];					// A list of AI states, indexed by state id
	_character.events = [];					// A list of events and the corresponding state id to
											// transition to when the event is triggered
	_character.create = function(data) {
		var c = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		c.baseType = "character";
		c.resolveCollisions = false;		// Detect collisions but don't resolve
		c.direction = vec2(data.direction || vec2(1, 0));
		
		// Initialise state
		c.alive = true;
		c.damageTime = 0;
		c.moveVector = vec2();
		c.jumped = false;
		c.jumping = false;
		c.firing = false;
		c.rateOfFireTimer = 0;
		c.canBreathe = true;
		c.breatheTime = data.breatheRate;
		
		// Initialise character properties
		c.active = !!data.active;
		c.maxHealth = data.maxHealth;
		c.health = Math.clamp(data.health, 0, c.maxHealth);
		c.damageInvulnerableTime = data.damageInvulnerableTime;
		c.rateOfFire = data.rateOfFire;
		c.flying = !!data.flying;
		c.useGravity = !data.flying;
		c.maxOxygen = data.maxOxygen;
		c.oxygen = Math.clamp(data.oxygen, 0, c.maxOxygen);
		c.breatheRate = data.breatheRate;
		c.visionType = data.visionType;
		c.invisible = !!data.invisible;
		c.invulnerable = !!data.invulnerable;
		c.powerAttack = !!data.powerAttack;
		c.regenerateHealth = !!data.regenerateHealth;
		c.projectileType = data.projectileType;
		c.speed = data.speed;
		c.maxSpeed = data.maxSpeed;
		c.jumpStrength = data.jumpStrength;
		c.waterBreathing = !!data.waterBreathing;
		c.touchDamage = data.touchDamage;
		c.touchKill = !!data.touchKill;
		c.events = data.events;
		
		// Initialise character states
		var states = [],
			state = null;
		if (data.states) {
			for (var i = data.states.length; i--;) {
				state = Z.characterState.create(c, data.states[i]);
				states[state.id] = state;
			}
		}
		c.states = states;
		
		// Start the initial state (idle)
		c.changeState("idle");
		return c;
	};
	_character.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Character initial direction can be set in the editor
		data.direction = [this.direction.X, this.direction.Y];
		
		// Only add character properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		set(this, data, "active");
		set(this, data, "health");
		set(this, data, "maxHealth");
		set(this, data, "damageInvulnerableTime");
		set(this, data, "flying");
		set(this, data, "rateOfFire");
		set(this, data, "oxygen");
		set(this, data, "maxOxygen");
		set(this, data, "breatheRate");
		set(this, data, "visionType");
		set(this, data, "invisible");
		set(this, data, "invulnerable");
		set(this, data, "powerAttack");
		set(this, data, "regenerateHealth");
		set(this, data, "projectileType");
		set(this, data, "speed");
		set(this, data, "maxSpeed");
		set(this, data, "jumpStrength");
		set(this, data, "waterBreathing");
		set(this, data, "touchDamage");
		set(this, data, "touchKill");
		
		// Events
		if (
			!Z.content.items[this.type].hasOwnProperty("events") ||
			Z.content.items[this.type].events === null ||
			JSON.stringify(Z.content.items[this.type].events) != JSON.stringify(this.events)
		) {
			data.events = this.events;
		}
		
		// States
		var states = [];
		for (var i in this.states) {
			if (this.states.hasOwnProperty(i)) {
				states.push(this.states[i].getData());
			}
		}
		if (
			!Z.content.items[this.type].hasOwnProperty("states") ||
			Z.content.items[this.type].states === null ||
			JSON.stringify(Z.content.items[this.type].states) != JSON.stringify(states)
		) {
			data.states = states;
		}
		return data;
	};
	_character.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.active = false;
		data.direction = [1, 0];
		data.health = null;					// Will use the value defined in data when null
		data.maxHealth = null;
		data.damageInvulnerableTime = null;
		data.flying = null;
		data.rateOfFire = null;
		data.oxygen = null;
		data.maxOxygen = null;
		data.breatheRate = null;
		data.visionType = null;
		data.events = null;
		data.states = null;
		return data;
	};
	_character.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		// ...
		return properties;
	};
	
	// Change the AI state
	_character.changeState = function(state) {
		if (this.states[state] && this.currentState != state) {
			this.previousState = this.currentState || state;
			this.currentState = state;
			this.states[this.currentState].start();
		}
	};
	
	// Handle an event by changing to the associated AI state (if one exists)
	_character.handleEvent = function(event) {
		if (this.events[event]) {
			this.changeState(this.events[event]);
		}
	};
	_character.update = function(elapsedTime) {
		this.sprite.animation = "idle";
		
		// Reset velocity
		this.velocity.X = 0;
		if (this.flying) { this.velocity.Y = 0; }
		
		// Test for player collision
		if (this.playerCollided && !this.playerCollideEvent) {
			this.handleEvent(Z.characterEvent.playerCollision);
			this.playerCollideEvent = true;
		}
		if (!this.playerCollided) {
			this.playerCollideEvent = false;
		}
		this.playerCollided = false;
		
		// Test for activation/deactivation
		if (this.active && !this.activatedEvent) {
			this.handleEvent(Z.characterEvent.activate);
			this.activatedEvent = true;
		}
		if (!this.active && this.activatedEvent) {
			this.handleEvent(Z.characterEvent.deactivate);
			this.activatedEvent = false;
		}
		
		// Test for immersion in liquid
		if (this.inLiquid && !this.liquidEvent) {
			this.handleEvent(Z.characterEvent.inLiquid);
			this.liquidEvent = true;
		}
		if (!this.inLiquid && this.liquidEvent) {
			this.handleEvent(Z.characterEvent.outLiquid);
			this.liquidEvent = false;
		}
		
		// Test for tile obstacle or gap
		if (this.tileEventDistance <= 0) {
			if (checkObstacle(this, Z.game.map)) {
				this.handleEvent(Z.characterEvent.obstacle);
				this.tileEventDistance = Z.settings.tileSize;
			
			// No obstacle detected, so check for a gap in the floor ahead
			} else if (checkGap(this, Z.game.map)) {
				this.handleEvent(Z.characterEvent.gap);
				this.tileEventDistance = Z.settings.tileSize;
			}
		}
		
		// Test for player proximity
		var playerCenter = vec2.add(Z.player.position, vec2.div(Z.player.size, 2)),
			characterCenter = vec2.add(this.position, vec2.div(this.size, 2));
		if (vec2.len(vec2.sub(playerCenter, characterCenter)) <= PROXIMITY_DISTANCE) {
			if (!this.playerProximityEvent) {
				this.handleEvent(Z.characterEvent.playerProximity);
				this.playerProximityEvent = true;
			}
		} else {
			this.playerProximityEvent = false;
		}
		
		// Test for player visibility
		var playerVisible = checkPlayerVisibility(this, Z.player, Z.game.map);
		if (playerVisible && !this.playerVisibleEvent) {
			this.handleEvent(Z.characterEvent.playerVisible);
			this.playerVisibleEvent = true;
		}
		if (!playerVisible && this.playerVisibleEvent) {
			this.handleEvent(Z.characterEvent.playerNotVisible);
			this.playerVisibleEvent = false;
		}
		
		// Update this character's current AI state
		if (this.currentState && this.states[this.currentState]) {
			this.states[this.currentState].update(elapsedTime);
		}
		
		// Set character direction and animation if moving
		if (this.moveVector.X) {
			this.direction = vec2(this.moveVector.X, 0);
			this.sprite.animation = "walk";
		}
		
		// If this character is standing on a tile with < 1 friction, reduce lateral movement force
		var slip = this.standingSurface ? (1 - this.standingSurface.friction) : 0;
		if (!this.falling && slip) {
			this.moveVector.X *= 1 - slip;
			
			// Clamp movevector to make sure the character still has some traction on
			// surfaces with 0 friction
			if (this.moveVector.X) {
				this.moveVector.X = this.moveVector.X > 0 ?
					Math.clamp(this.moveVector.X, Z.settings.minMoveForce, 1) :
					Math.clamp(this.moveVector.X, -1, -Z.settings.minMoveForce);
			}
		}
		
		// Check if this character is standing on a conveyor tile
		var conveyor = 0;
		if (this.standingSurface && this.standingSurface.conveyor) {
			conveyor = this.standingSurface.conveyor * elapsedTime;
		}
		
		// Move this character left/right/jump depending on user input
		this.velocity.X += this.moveVector.X * this.speed * elapsedTime;
		this.velocity.X -= conveyor;	// Modify velocity if standing on a conveyor
		
		// Apply jump velocity if this character has just jumped
		if (this.jumped) {
			if (this.onLiquidSurface) {	// If jumping from near liquid surface, set velocity
										// manually to prevent super jumping (ie. when character is
										// already moving upwards)
				this.velocity.Y = -this.jumpStrength;
			} else {	// Otherwise modify velocity normally
				this.velocity = vec2.add(this.velocity, vec2(0, -this.jumpStrength));
			}
		}
		
		// Falling animation
		if (this.falling) {
			this.sprite.animation = "fall";
		}
		
		// Jumping animation
		if (this.jumping) {
			this.sprite.animation = this.velocity.Y <= 0 ? "jump" : "fall";
		}
		
		// If this character is standing on a tile and not trying to move, apply surface resistance
		if (!this.falling && !this.moveVector.X) {
			this.velocity.X *= slip;
		}
		
		// Clamp lateral velocity to maximum character movement speed (if standing on a conveyor
		// tile, modify maximum speed accordingly)
		var max = this.maxSpeed * elapsedTime;
		this.velocity.X = Math.clamp(this.velocity.X, -max + conveyor, max + conveyor);
		
		// If in liquid, clamp y velocity and apply liquid resistance to x velocity
		if (this.inLiquid) {
			if (!this.jumping) {	// Only resist movement if not jumping
				this.velocity.Y = Math.clamp(this.velocity.Y, -max, max);
				this.velocity.X *= Z.settings.liquidResistance;
			} else if (!this.onLiquidSurface) {	// Stop jumping if fully submerged in liquid
				this.jumping = false;
			}
		}
		
		// Check if this character has landed from a jump (either on a standable surface or a
		// ladder)
		var y = Math.round(this.velocity.Y * 100) / 100;	// Use rounded y-velocity
		if (y >= 0 && (!this.falling || this.onLadder)) {
			this.jumping = false;
		}
		
		// Fire weapon
		this.rateOfFireTimer = Math.max(this.rateOfFireTimer - elapsedTime, 0);
		if (	// Make sure rate of fire countdown timer has expired
			this.rateOfFireTimer <= 0 &&
			this.firing
		) {
			// Calculate projectile starting offset based on current facing direction
			var offset = vec2(this.sprite.animations[this.sprite.animation].barrelOffset);
			if (this.direction.X < 0) {
				var projectileWidth = Z.content.items[this.projectileType].size[0];
				offset.X = this.sprite.tileSize.X - offset.X - projectileWidth;
			}
			offset = vec2.add(offset, this.sprite.actorOffset);
			Z.game.map.actors.push(Z.projectile.create(	// Create projectile actor
				vec2.add(this.position, offset),
				this.baseType,
				this.powerAttack,
				vec2(this.direction),
				Z.content.items[this.projectileType]
			));
			this.rateOfFireTimer = this.rateOfFire;
		}
		
		// Play firing animation
		if (this.firing) {
			this.sprite.animation = "fire";
		}
		
		// Check if this character is submerged in non-breathable liquid
		this.canBreathe = true;
		if (this.inLiquid && !this.onLiquidSurface) {
			var tile = vec2.map(vec2.div(this.position, Z.settings.tileSize), Math.floor);
			if (
				tile.X >= 0 && tile.X < Z.game.map.size.X &&
				tile.Y >= 0 && tile.Y < Z.game.map.size.Y &&
				!Z.world.tileTypes[Z.game.map.tiles[tile.Y][tile.X]].breathable
			) {
				this.canBreathe = false;
			}
		}
		if (!this.canBreathe) {
			this.breatheTime = Math.max(this.breatheTime - elapsedTime, 0);
			if (this.breatheTime <= 0) {
				this.breatheTime = this.breatheRate;
				
				// Don't deplete oxygen or health if player can breathe underwater
				if (!this.waterBreathing) {
					if (this.oxygen > 0) {
						this.oxygen--;
					} else {
						this.damage(1);
					}
				}
			}
		} else {
			this.oxygen = this.maxOxygen;
		}
		
		// Deplete damage timer
		if (this.damageTime >= 0) {
			this.damageTime -= elapsedTime;
		}
		
		// If this character has died, play dead animation
		if (!this.alive) {
			this.sprite.animation = "die";
		}
		
		// Reset state ready for next frame
		this.moveVector = vec2();
		this.jumped = false;
		this.firing = false;
		this.tileEventDistance = Math.max(this.tileEventDistance - vec2.len(this.velocity), 0);
		base.update.apply(this, arguments);
	};
	_character.handleCollision = function(actor, translation) {
		if (actor.type == "player") {
			this.playerCollided = true;
			
			// If this character has touch damage, damage the player
			if (this.touchDamage > 0) {
				actor.damage(this.touchDamage);
			}
			
			// If this character has touch kill set, kill the player immediately
			if (this.touchKill) {
				actor.die();
			}
		}
		base.handleCollision.apply(this, arguments);
	};
	_character.damage = function(amount) {
		// Ignore damage if this character is invulnerable
		if (this.invulnerable) {
			this.handleEvent(Z.characterEvent.damage);
			return;
		}
		
		// Apply damage (unless this character is temporarily invulnerable from previous damage)
		if (this.damageTime <= 0) {
			this.health = Math.clamp(this.health - amount, 0, this.maxHealth);
			this.handleEvent(Z.characterEvent.damage);
			
			// Make this character invulnerable for a short time
			this.damageTime = this.damageInvulnerableTime;
		}
		
		// Check if this character has died
		if (this.health <= 0) {
			this.die();
		
		// Otherwise, if this character regenerates health, set health to maximum (ie. character
		// must be killed in one hit when this is set)
		} else if (this.regenerateHealth) {
			this.health = this.maxHealth;
		}
	};
	_character.die = function() {
		this.alive = false;
		this.handleEvent(Z.characterEvent.dead);
		
		// Play death animation (character jumps into the air and falls out of the map)
		this.velocity = vec2(0, -DIE_JUMP_STRENGTH);
		this.collideTiles = false;
		this.collideActors = false;
		
		// Dispose when the death animation finishes playing
		var self = this;
		this.sprite.animations["die"].finishedCallback = function() { self.disposed = true; };
	};
	_character.draw = function(context) {
		context.save();
		
		// Set invisibility alpha if invisible
		if (this.invisible) {
			context.globalAlpha = INVISIBLE_ALPHA;
		}
		
		// If invulnerable from damage or invulnerability powerup, oscillate character alpha (this
		// overrides invisibility if set)
		if (this.damageTime >= 0 && !Z.editor) {
			var i = (1 + Math.sin(this.damageTime * DAMAGE_INVULNERABLE_RATE * Math.PI * 2)) * 0.5;
			context.globalAlpha = Math.clamp(
				DAMAGE_INVULNERABLE_AMOUNT + i * (1 - DAMAGE_INVULNERABLE_AMOUNT)
			);
		}
		base.draw.apply(this, arguments);
		context.restore();
	};
	return _character;
}(Z.actor));