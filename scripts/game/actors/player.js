Z.player = (function(base) {
	"use strict";
	
	var TAKEOFF_STRENGTH = 2.5,				// Takeoff strength when starting to fly
		INVISIBLE_ALPHA = 0.3,				// Alpha level when invisible
		DIE_JUMP_STRENGTH = 7.5,			// Jump strength for death animation
		DIE_RESTART_TIME = 1.5,				// When player dies, restart the current map after this
											// amount of time (seconds)
		DAMAGE_INVULNERABLE_TIME = 2,		// When damaged, player becomes invulnerable for this
											// amount of time (seconds)
		DAMAGE_INVULNERABLE_RATE = 3.5,		// Alpha oscillation rate while invulnerable (hz)
		DAMAGE_INVULNERABLE_AMOUNT = 0.3,	// Minimum alpha while invulnerable
		BREATHE_RATE = 2;					// Oxygen will be depleted at this rate (seconds)
	
	// Return true if the main or alternate key mapping for a control is currently held down
	var controlDown = function(control) {
		return checkControl(control, Z.player.controls, "keyDown");
	};
	
	// Return true if the main or alternate key mapping for a control has been pressed
	var controlPressed = function(control) {
		return checkControl(control, Z.player.controls, "keyPressed");
	};
	
	// Check if a main or alternative control mapping has been activated/is currently activated
	//	control:	The control to check
	//	c:			The list of controls
	//	k:			A function for checking keyboard input
	var checkControl = function(control, c, k) {
		if (c[control]) {
			return (
				Z.input[k](c[control][0]) ||
				(c[control].length > 1 && c[control][1] && Z.input[k](c[control][1]))
			);
		}
		return false;
	};
	
	// Check if the player is currently blocked from standing up (from crouched position) by
	// any tiles (either solid or with bottom edge)
	var checkCrouchPoints = function(player, map) {
		// Get the tile position of two points above the player's current position (each top
		// corner, assuming the player is currently crouched)
		var heightDelta = player.originalHeight - player.crouchHeight,
			p1 = vec2.add(player.position, vec2(0, -heightDelta)),
			p2 = vec2.add(player.position, vec2(player.size.X, -heightDelta));
		
		var checkTileType = function(t) { return t.solid || t.bottomEdge; };
		return (
			Z.collision.checkPoint(p1, map, checkTileType) ||
			Z.collision.checkPoint(p2, map, checkTileType)
		);
	};
	
	var _player = base.create("player", "player", "Player", vec2(), vec2(), null);
	_player.baseType = "player";
	_player.controls = null;		// An array of primary & secondary control key codes
	_player.speed = 0;				// Acceleration in x-axis
	_player.maxSpeed = 0;			// Maximum x-axis movement speed
	_player.jumpStrength = 0;		// Jump velocity amount
	_player.health = 0;				// Current/initial health
	_player.maxHealth = 0;			// Maximum number of health points
	_player.maxSuperHealth = 0;		// Maximum number of health points from super health powerups
	_player.alive = true;			// True if player is currently alive
	_player.deadTime = 0;			// Player death timer (for restarting the map)
	_player.damageTime = 0;			// Damage invulnerability timer
	_player.moveVector = vec2();	// Requested movement for this frame
	_player.jumped = false;			// Just started jumping (need to apply jump velocity)
	_player.jumping = false;		// Currently in a jump
	_player.originalHeight = 0;		// The player's original height
	_player.crouchHeight = 0;		// The player's height when crouching
	_player.crouched = false;		// Currently crouching
	_player.fired = false;			// Currently firing (for semi-automatic firing)
	_player.firing = false;			// Currently firing (for automatic firing)
	_player.projectileType = "";	// The player's projectile content type
	_player.rateOfFire = 0;			// Rate of fire when automatic firing is disabled
	_player.autoRateOfFire = 0;		// Rate of fire when automatic firing is enabled
	_player.rateOfFireTimer = 0;	// Rate of fire countdown timer
	_player.autoFire = false;		// Automatic projectile firing
	_player.allowFlying = false;	// Can player fly
	_player.flying = false;			// Currently flying
	_player.takeOff = false;		// Just started flying (need to apply takeoff velocity)
	// TODO _player.use fires once (1 frame) when use key pressed, add another entity usepressedmarker, use this for doors
	_player.using = false;			// Currently using/activating (use key is pressed down)
	_player.invisible = false;		// Player can't be seen by some enemy types when invisible
	_player.invulnerable = false;	// Player cannot take damage or die while invulnerable
	_player.powerAttack = false;	// Projectiles do more damage when this is active
	_player.waterBreathing = false;	// True if the player can currently breathe underwater
	_player.oxygen = 0;				// The current oxygen level (depleted while underwater)
	_player.maxOxygen = 0;			// The maximum oxygen level
	_player.canBreathe = true;		// True if the player can currently breathe
	_player.breatheTime = 0;		// Breathing timer (for depleting oxygen while underwater)
	_player.powerups = [];			// List of currently active powerup effects
	_player.inventory = [];			// List of objects in player inventory, indexed by id
	_player.points = 0;				// The number of points accumulated so far
	_player.initialise = function(position) {
		this.position = vec2(position);
		
		// Reset state
		this.alive = true;
		this.deadTime = 0;
		this.damageTime = 0;
		this.canBreathe = true;
		this.breatheTime = BREATHE_RATE;
		this.collideActors = true;
		this.collideTiles = true;
		this.jumping = false;
		this.crouched = false;
		this.powerups = [];
		this.inventory = [];
		
		// Initialise player properties from loaded data
		var data = Z.content.items["player"];
		this.name = data.name;
		this.sprite = Z.sprite.create(data.spriteData);
		this.size = vec2(data.size);
		this.crouchHeight = data.crouchHeight;
		this.originalHeight = this.size.Y;
		this.speed = data.speed;
		this.maxSpeed = data.maxSpeed;
		this.jumpStrength = data.jumpStrength;
		this.maxHealth = data.maxHealth;
		this.maxSuperHealth = data.maxSuperHealth;
		this.health = Math.clamp(data.health, 0, Math.max(this.maxHealth, this.maxSuperHealth));
		this.projectileType = data.projectileType;
		this.rateOfFire = data.rateOfFire;
		this.autoRateOfFire = data.autoRateOfFire;
		this.autoFire = !!data.autoFire;
		this.allowFlying = !!data.allowFlying;
		this.invisible = !!data.invisible;
		this.invulnerable = !!data.invulnerable;
		this.powerAttack = !!data.powerAttack;
		this.maxOxygen = data.maxOxygen;
		this.oxygen = Math.clamp(data.oxygen, 0, this.maxOxygen);
		this.waterBreathing = !!data.waterBreathing;
		
		// Player controls
		this.controls = Z.content.items["controls"];
	};
	_player.dispose = function() { };
	_player.handleInput = function() {
		// Cannot control player if dead
		if (!this.alive) { return; }
		
		// Reset movement for this frame
		this.moveVector = vec2();
		
		// Left/right movement
		if (controlDown("right")) {
			this.moveVector.X = 1;
		} else if (controlDown("left")) {
			this.moveVector.X = -1;
		}
		
		// Up/down movement (for ascending/descending ladders, flying, and when in liquid)
		if (controlDown("down")) {
			this.moveVector.Y = 1;
		} else if (controlDown("up")) {
			this.moveVector.Y = -1;
		}
		
		// Jump
		if (
			controlPressed("jump") &&
			(!this.falling || this.onLadder || this.onLiquidSurface) &&
			!(Z.input.keyDown(Keys.Up) && this.onLadder)	// Prevent super-jumping from tops of
															// ladders when up key is held down
		) {
			this.jumped = true;
			this.inLiquid = false;	// Allow player to jump out of liquids
			this.jumping = true;
		}
		
		// Crouch
		var crouched = (
			Z.input.keyDown(Keys.C) &&
			!(
				this.falling ||
				this.inLiquid ||
				this.onLiquidSurface ||
				(this.onLadder && !this.standingSurface)
			)
		);
		if (crouched && !this.crouched) {
			this.crouched = true;
			this.size.Y = this.crouchHeight;
			this.position.Y += this.originalHeight - this.crouchHeight;
		}
		if (!crouched && this.crouched && !checkCrouchPoints(this, Z.game.map)) {
			this.crouched = false;
			this.size.Y = this.originalHeight;
			this.position.Y -= this.originalHeight - this.crouchHeight;
		}
		
		// Fire
		if (controlPressed("attack")) {
			this.fired = true;
		}
		this.firing = controlDown("attack");
		
		// Fly
		if (this.allowFlying && controlPressed("fly")) {
			this.takeOff = true;
		}
		this.flying = this.allowFlying && controlDown("fly");
		
		// Use
		this.using = controlDown("use");
	};
	
	// Apply the specified amount of damage to the player (and die if health goes below 0)
	_player.damage = function(amount) {
		// Ignore damage if player is invulnerable
		if (this.invulnerable) { return; }
		
		// Apply damage (unless player is temporarily invulnerable from previous damage)
		if (this.damageTime <= 0) {
			this.health = Math.clamp(this.health - amount, 0, this.maxHealth);
			
			// Make player invulnerable for a short time
			this.damageTime = DAMAGE_INVULNERABLE_TIME;
		}
		
		// Check if player has died
		if (this.health <= 0) {
			this.die();
		}
	};
	
	// Kill the player and start playing the death animation
	_player.die = function() {
		this.alive = false;
		
		// Fix camera position by linking it to an anonymous object with player's current position
		Z.camera.initialise({ position: vec2(this.position), size: this.size }, false);
		
		// Play death animation (player jumps into the air and falls out of the map)
		this.velocity = vec2(0, -DIE_JUMP_STRENGTH);
		this.collideTiles = false;
		this.collideActors = false;
	};
	
	// Add the specified amount of points to the player
	_player.addPoints = function(points) {
		this.points += points;
	};
	
	// Add a powerup to the player that will get updated every frame (this is for constant-effect
	// powerups or powerups that have an expiry time)
	_player.addPowerup = function(type, sprite, update) {
		// If there is already a powerup of the specified type in effect, force it to expire
		// immediately before replacing it
		if (this.powerups[type]) {
			this.powerups[type].update(0, true);
		}
		
		// Add an object containing the powerup sprite (so it can be displayed in the hud) and a
		// function that will update the powerup's expiry time
		this.powerups[type] = {
			sprite: sprite,
			time: 1,
			update: update
		};
	};
	
	// Add the specified amount of an inventory powerup type to the player's inventory
	_player.addInventory = function(type, sprite, amount, stackable, maxCount) {
		// If this item is already in the player's inventory (and can be stacked), increment
		// the inventory count (up to the maximum)
		if (this.inventory[type]) {
			this.inventory[type].count = Math.clamp(
				this.inventory[type].count + amount,
				0,
				stackable ? maxCount : 1
			);
		
		// Otherwise, if the item doesn't already exist, add the item's sprite to the player's
		// inventory (so it can be displayed in the hud)
		} else {
			this.inventory[type] = {
				sprite: sprite,
				count: Math.clamp(amount, 0, stackable ? maxCount : 1)
			};
		}
		
		// If this item's count is less than 1, remove it from the player's inventory
		if (this.inventory[type].count < 1) {
			delete this.inventory[type];
		}
	};
	_player.update = function(elapsedTime) {
		this.sprite.animation = this.crouched ? "crouch" : "idle";
		
		// Set player direction and animation if moving
		if (this.moveVector.X) {
			this.direction = vec2(this.moveVector.X, 0);
			this.sprite.animation = this.crouched ? "crawl" : "walk";
		}
		
		// If player is standing on a tile with < 1 friction, reduce lateral movement force
		var slip = this.standingSurface ? (1 - this.standingSurface.friction) : 0;
		if (!this.falling && slip) {
			this.moveVector.X *= 1 - slip;
			
			// Clamp movevector to make sure player still has some traction on
			// surfaces with 0 friction
			if (this.moveVector.X) {
				this.moveVector.X = this.moveVector.X > 0 ?
					Math.clamp(this.moveVector.X, Z.settings.minMoveForce, 1) :
					Math.clamp(this.moveVector.X, -1, -Z.settings.minMoveForce);
			}
		}
		
		// Check if player is standing on a conveyor tile
		var conveyor = 0;
		if (this.standingSurface && this.standingSurface.conveyor) {
			conveyor = this.standingSurface.conveyor * elapsedTime;
		}
		
		// Move player left/right/jump depending on user input
		this.velocity.X += this.moveVector.X * this.speed * elapsedTime;
		this.velocity.X -= conveyor;	// Modify velocity if standing on a conveyor
		
		// Apply jump velocity if player has just jumped
		if (this.jumped) {
			if (this.onLiquidSurface) {	// If jumping from near liquid surface, set velocity
										// manually to prevent super jumping (ie. when player is
										// already moving upwards)
				this.velocity.Y = -this.jumpStrength;
			} else {	// Otherwise modify velocity normally
				this.velocity = vec2.add(this.velocity, vec2(0, -this.jumpStrength));
			}
		}
		
		// Apply takeoff velocity if player has just started flying
		if (this.takeOff) {
			this.velocity = vec2.add(this.velocity, vec2(0, -TAKEOFF_STRENGTH));
		}
		
		// Disable flying if player has landed
		if (this.flying && !this.falling) {
			this.flying = false;
		}
		
		// Falling animation (check this before climbing/flying/swimming)
		if (this.falling) {
			this.sprite.animation = "fall";
		}
		
		// Allow up/down movement if player is on a ladder or liquid tile or is flying
		if (
			(this.onLadder && !this.jumping) ||
			(this.falling && this.flying) ||
			this.inLiquid
		) {
			this.velocity.Y += this.moveVector.Y * this.speed * elapsedTime;
			this.falling = !this.onLadder;	// Not falling if currently on a ladder
		} else if (this.jumping) {	// Play jumping/falling animation if currently jumping
			this.sprite.animation = this.velocity.Y <= 0 ? "jump" : "fall";
		}
		
		// If player is standing on a tile and not trying to move, apply surface resistance
		if (!this.falling && !this.moveVector.X) {
			this.velocity.X *= slip;
		}
		
		// Clamp lateral velocity to maximum player movement speed (if standing on a conveyor tile,
		// modify maximum speed accordingly)
		var max = this.maxSpeed * elapsedTime;
		this.velocity.X = Math.clamp(this.velocity.X, -max + conveyor, max + conveyor);
		
		// If flying, clamp upwards velocity by maximum movement speed
		if (this.flying) {
			this.velocity.Y = Math.clamp(this.velocity.Y, -max, Z.settings.maxSpeed);
			if (!this.onLadder) {	// Use flying animation if not currently on a ladder
				this.sprite.animation = "fly";
			}
		}
		
		// If in liquid, clamp y velocity and apply liquid resistance to x velocity
		if (this.inLiquid) {
			if (!this.jumping) {	// Only resist movement if not jumping
				this.velocity.Y = Math.clamp(this.velocity.Y, -max, max);
				this.velocity.X *= Z.settings.liquidResistance;
			} else if (!this.onLiquidSurface) {	// Stop jumping if fully submerged in liquid
				this.jumping = false;
			}
		}
		
		// Swimming animation
		if (this.inLiquid || this.onLiquidSurface) {
			this.sprite.animation = (this.moveVector.Y || this.moveVector.X) ?
				"swim" :
				"swimidle";
		}
		
		// If on a ladder, clamp y velocity to player movement speed and apply movement resistance
		if (this.onLadder && !this.jumping) {
			if (!this.moveVector.Y) {
				this.velocity.Y = 0;
			}
			this.velocity.Y = Math.clamp(this.velocity.Y, -max, max);
			if (!this.standingSurface) {
				this.sprite.animation = (this.moveVector.Y || this.moveVector.X) ?
					"climb" :
					"climbidle";
			}
		}
		
		// Check if player has landed from a jump (either on a standable surface or a ladder)
		var y = Math.round(this.velocity.Y * 100) / 100;	// Use rounded y-velocity
		if (y >= 0 && (!this.falling || this.onLadder)) {
			this.jumping = false;
		}
		
		// Fire weapon
		this.rateOfFireTimer -= elapsedTime;
		if (	// Make sure rate of fire countdown timer has expired
			this.rateOfFireTimer <= 0 &&
			((this.autoFire && this.firing) || (!this.autoFire && this.fired))
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
			this.rateOfFireTimer = this.autoFire ? this.autoRateOfFire : this.rateOfFire;
		}
		
		// Check if the player is submerged in non-breathable liquid
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
				this.breatheTime = BREATHE_RATE;
				
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
		
		// If player is invulnerable, keep resetting damageTime so that invulnerability animation
		// plays indefinitely
		if (this.invulnerable && this.damageTime <= 0) {
			this.damageTime = DAMAGE_INVULNERABLE_TIME;
		}
		
		// Update any active powerups
		for (var i in this.powerups) {
			if (!this.powerups.hasOwnProperty(i)) { continue; }
			this.powerups[i].update(elapsedTime);
		}
		
		// If player has died, play dead animation and restart the current map
		if (!this.alive) {
			this.sprite.animation = "die";
			
			// Increment dead timer or restart the current map
			if (this.deadTime >= DIE_RESTART_TIME) {
				Z.stateManager.push(Z.message.create(
					"You are dead!",
					Z.messageType.information,
					"Press a key to restart..."
				));
				Z.game.restart();
			} else {
				this.deadTime += elapsedTime;
			}
		}
		
		// Reset input state ready for next frame
		this.jumped = false;
		this.takeOff = false;
		this.fired = false;
		base.update.apply(this, arguments);
	};
	_player.draw = function(context) {
		context.save();
		
		// Set invisibility alpha if invisible
		if (this.invisible) {
			context.globalAlpha = INVISIBLE_ALPHA;
		}
		
		// If invulnerable from damage or invulnerability powerup, oscillate player alpha (this
		// overrides invisibility if set)
		if (this.damageTime >= 0) {
			var i = (1 + Math.sin(this.damageTime * DAMAGE_INVULNERABLE_RATE * Math.PI * 2)) * 0.5;
			context.globalAlpha = Math.clamp(
				DAMAGE_INVULNERABLE_AMOUNT + i * (1 - DAMAGE_INVULNERABLE_AMOUNT)
			);
		}
		base.draw.apply(this, arguments);
		context.restore();
	};
	return _player;
}(Z.actor));