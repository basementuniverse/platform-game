Z.characterState = (function() {
	"use strict";
	
	// Set a property in the character if it exists (and isn't null) in the specified state
	var set = function(state, character, property) {
		if (state[property] !== null && state[property] !== undefined) {
			character[property] = state[property];
		}
	};
	
	// Get data for the specified action
	var getActionData = function(action) {
		var data = { id: "", time: 0 };
		for (var i in action) {
			if (action.hasOwnProperty(i) && i != "triggered") {
				data[i] = action[i];
			}
		}
		return data;
	};
	
	// Actions
	var actions = {
		
		// Remain idle
		idle: function() { },
		
		// Change to a different state
		changeState: function(action) {
			if (action.triggered) { return; }
			if (!action.state) { return; }
			this.character.changeState(action.state);
		},
		
		// Change to the character's previous state
		revertState: function(action) {
			if (action.triggered) { return; }
			this.character.changeState(this.character.previousState);
		},
		
		// Restart the current state
		restartState: function(action) {
			if (action.triggered) { return; }
			this.currentActionIndex = -1;
			this.currentActionTime = 0;
		},
		
		// Random chance to change to a different state
		randomState: function(action) {
			if (action.triggered) { return; }
			if (!action.chance) { return; }
			if (!action.state) { return; }
			if (Math.random() <= action.chance) {
				this.character.changeState(action.state);
			}
		},
		
		// Set the current action time to a random value between min and max (exclusive) in seconds
		waitRandom: function(action) {
			if (action.triggered) { return; }
			var min = action.min || 0,
				max = action.max || 1;
			this.currentActionTime = Math.randomBetween(min, max);
		},
		
		// Turn to face the player
		facePlayer: function(action) {
			if (action.triggered) { return; }
			
			// Get x-center of player and character
			var playerCenter = Z.player.position.X + Z.player.size.X / 2,
				characterCenter = this.character.position.X + this.character.size.X / 2;
			if (playerCenter > characterCenter) {
				this.character.direction.X = 1;
			} else if (playerCenter < characterCenter) {
				this.character.direction.X = -1;
			}
		},
		
		// Turn in the opposite direction
		faceOpposite: function(action) {
			if (action.triggered) { return; }
			this.character.direction.X *= -1;
		},
		
		// Turn to face the specified direction
		faceDirection: function(action) {
			if (action.triggered) { return; }
			if (!action.direction) { return; }
			if (action.direction == "left") {
				this.character.direction.X = -1;
			} else if (action.direction == "right") {
				this.character.direction.X = 1;
			}
		},
		
		// Move in the specified direction (or in the current facing direction)
		move: function(action) {
			if (action.direction == "up") {
				this.character.moveVector.Y = -1;
			} else if (action.direction == "down") {
				this.character.moveVector.Y = 1;
			} else if (action.direction == "left") {
				this.character.direction.X = -1;
				this.character.moveVector.X = -1;
			} else if (action.direction == "right") {
				this.character.direction.X = 1;
				this.character.moveVector.X = 1;
			} else {
				this.character.moveVector.X = this.character.direction.X;
			}
		},
		
		// Stop all movement
		stop: function() {
			this.character.moveVector = vec2();
		},
		
		// Jump
		jump: function(action) {
			if (action.triggered) { return; }
			this.character.jumped = true;
			this.character.jumping = true;
		},
		
		// Fire weapon
		fire: function() {
			this.character.firing = true;
		},
		
		// Add a caption above the actor
		say: function(action) {
			if (action.triggered) { return; }
			if (!action.message) { return; }
			Z.captionManager.add(action.message, this.character.id);
		},
		
		// Play an animation
		animate: function(action) {
			if (!action.animation) { return; }
			if (!this.character.sprite.animations[action.animation]) { return; }
			this.character.sprite.animation = action.animation;
		},
		
		// Damage the character
		damage: function(action) {
			if (action.triggered) { return; }
			var amount = action.amount || 1;
			this.character.damage(amount);
		},
		
		// Kill the character
		die: function(action) {
			if (action.triggered) { return; }
			this.character.die();
		},
		
		// Damage the player
		damagePlayer: function(action) {
			if (action.triggered) { return; }
			var amount = action.amount || 1;
			Z.player.damage(amount);
		},
		
		// Kill the player
		killPlayer: function(action) {
			if (action.triggered) { return; }
			Z.player.die();
		},
		
		// Play a sound effect
		sound: function(action) {
			if (action.triggered) { return; }
			if (!action.soundId) { return; }
			var volumn = action.volume || 1,
				pan = action.pan || 0;
			Z.sound.play(action.soundId, volume, pan);
		}
	};
	
	return {
		character: null,
		id: "",
		actions: [],
		currentAction: null,
		currentActionIndex: 0,
		currentActionTime: 0,
		invisible: null,
		invulnerable: null,
		powerAttack: null,
		regenerateHealth: null,
		projectileType: null,
		speed: null,
		maxSpeed: null,
		jumpStrength: null,
		waterBreathing: null,
		touchDamage: null,
		touchKill: null,
		create: function(character, data) {
			var s = Object.create(this);
			s.character = character;
			s.id = data.id;
			s.actions = data.actions;
			s.currentAction = null;
			s.currentActionIndex = 0;
			s.currentActionTime = 0;
			s.invisible = data.invisible;
			s.invulnerable = data.invulnerable;
			s.powerAttack = data.powerAttack;
			s.regenerateHealth = data.regenerateHealth;
			s.projectileType = data.projectileType;
			s.speed = data.speed;
			s.maxSpeed = data.maxSpeed;
			s.jumpStrength = data.jumpStrength;
			s.waterBreathing = data.waterBreathing;
			s.touchDamage = data.touchDamage;
			s.touchKill = data.touchKill;
			return s;
		},
		getData: function() {
			var data = {
				id: this.id,
				actions: [],
				invisible: this.invisible,
				invulnerable: this.invulnerable,
				powerAttack: this.powerAttack,
				regenerateHealth: this.regenerateHealth,
				projectileType: this.projectileType,
				speed: this.speed,
				maxSpeed: this.maxSpeed,
				jumpStrength: this.jumpStrength,
				waterBreathing: this.waterBreathing,
				touchDamage: this.touchDamage,
				touchKill: this.touchKill
			};
			
			// Get actions data
			for (var i = 0, length = this.actions.length; i < length; i++) {
				data.actions.push(getActionData(this.actions[i]));
			}
			return data;
		},
		
		// Initialise this state
		start: function() {
			set(this, this.character, "invisible");
			set(this, this.character, "invulnerable");
			set(this, this.character, "powerAttack");
			set(this, this.character, "regenerateHealth");
			set(this, this.character, "projectileType");
			set(this, this.character, "speed");
			set(this, this.character, "maxSpeed");
			set(this, this.character, "jumpStrength");
			set(this, this.character, "waterBreathing");
			set(this, this.character, "touchDamage");
			set(this, this.character, "touchKill");
			
			// Initialise actions
			this.currentActionIndex = -1;
			this.currentActionTime = 0;
		},
		
		// Perform this state's actions sequentially
		update: function(elapsedTime) {
			// If the current action time has expired, start the next action
			if (this.currentActionTime <= 0 && this.currentActionIndex < this.actions.length) {
				this.currentActionIndex++;
				this.currentAction = this.actions[this.currentActionIndex];
				if (this.currentAction) {
					this.currentActionTime = this.currentAction.time || 0;
					this.currentAction.triggered = false;
				}
			}
			
			// Execute the current action
			if (this.currentAction && actions[this.currentAction.id]) {
				actions[this.currentAction.id].call(this, this.currentAction);
				this.currentAction.triggered = true;
			}
			this.currentActionTime = Math.max(this.currentActionTime - elapsedTime, 0);
		}
	};
}());