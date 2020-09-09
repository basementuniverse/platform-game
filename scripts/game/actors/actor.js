Z.actor = (function() {
	"use strict";
	
	var _actor = {
		id: "",
		itemType: "actor",			// Item type (actor, entity or light)
		baseType: "",				// The type of constructor to use when creating instances of
									// this actor (should be one of the keys of Z.actorTypes)
		type: "",					// The content type for this actor
		name: "",
		position: vec2(),
		velocity: vec2(),
		size: vec2(),
		direction: vec2(1, 0),
		disposed: false,			// True if this actor should be removed next frame
		sprite: null,
		falling: false,				// True if standing on a solid tile or another actor
		useGravity: true,			// Should this actor fall when not standing on something
		onLadder: false,			// True if currently overlapping a ladder tile
		inLiquid: false,			// True if currently overlapping a liquid tile
		onLiquidSurface: false,		// True if currently near a liquid surface
		collideTiles: true,			// Should this actor collide with tiles
		collideActors: true,		// Should this actor collide with other actors
		pushable: false,			// True if this actor can be pushed by other actors
		pushFriction: 1,			// The friction to apply when being pushed (simulates weight)
		beingPushed: false,			// True if currently being pushed by another actor
		resolveCollisions: true,	// True if this actor should respond to actor collisions
		standingActors: [],			// A list of actors standing on top of this actor
		standingSurface: null,		// The current surface type this actor is standing on (null if
									// falling or standing on another actor)
		
		// Create and return a new actor object
		//	id:			The actor id (so that entities can reference the actor, optional)
		//	type:		The actor content type
		//	name:		The actor's name
		//	position:	The initial position (top left corner)
		//	size:		The actor's size in pixels
		//	sprite:		A sprite instance (optional)
		create: function(id, type, name, position, size, sprite) {
			var a = Object.create(this);
			a.id = id;
			a.type = type;
			a.name = name;
			a.position = position;
			a.size = size;
			
			// Initialise sprite if one exists
			if (sprite) {
				a.sprite = sprite;
			}
			return a;
		},
		load: function(callback, path, data) {
			Z.utilities.loadData(function(actorData) {
				Z.sprite.load(function(spriteData) {
					actorData.spriteData = spriteData;
					callback(actorData);
				}, actorData.spritePath, actorData.spriteData);
			}, path, data);
		},
		getData: function() {
			return {
				type: this.type,
				id: this.id,
				position: [this.position.X, this.position.Y]
			};
		},
		getEmptyData: function(id, type, position) {
			return {
				id: id,
				type: type,
				position: position
			};
		},
		getEditorProperties: function() {
			return [];
		},
		update: function(elapsedTime) {
			// Apply gravity if this actor is gravity-enabled and currently falling
			if (this.useGravity && this.falling) {
				var gravity = Z.settings.gravity;
				if (this.flying) { gravity = Z.settings.flyingGravity; }	// Actor is flying
				if (this.inLiquid) { gravity = Z.settings.liquidGravity; }	// Actor is in liquid
				this.velocity.Y += gravity;
				this.velocity.X *= Z.settings.airResistance; // Apply air resistance
			}
			
			// If this actor is pushable and standing on a surface, apply surface resistance
			if (!this.falling && this.pushable && !this.beingPushed) {
				this.velocity.X *= this.standingSurface ? (1 - this.standingSurface.friction) : 0;
			}
			
			// Clamp velocity to maximum speed
			var max = Z.settings.maxSpeed * elapsedTime;
			this.velocity = vec2.map(this.velocity, Math.clamp, -max, max);
			
			// Translate any actors standing on this actor
			for (var i = this.standingActors.length; i--;) {
				this.standingActors[i].position.X += this.velocity.X;
				this.standingActors[i].position.Y = this.position.Y - this.standingActors[i].size.Y;
				
				// If this actor is moving vertically (not due to gravity), move standing actors at
				// the same rate, otherwise stop standing actor's vertical movement completely
				if (!this.useGravity && this.velocity.Y) {
					this.standingActors[i].velocity.Y = this.velocity.Y;
				} else {
					this.standingActors[i].velocity.Y = 0;
				}
			}
			
			// If this actor is standing on a conveyor tile, apply velocity (this is done after
			// updating standing actors so that the conveyor effect doesn't affect them as well)
			if (this.standingSurface && this.standingSurface.conveyor) {
				this.velocity.X += this.standingSurface.conveyor * elapsedTime;
			}
			
			// If in liquid, apply liquid resistance to y velocity
			if (this.inLiquid) {
				this.velocity.Y *= Z.settings.liquidResistance;
			}
			
			// Update sprite if one exists
			if (this.sprite) {
				this.sprite.update(elapsedTime);
			}
			
			// Reset state ready for next frame
			this.falling = this.useGravity;
			this.onLadder = false;
			this.inLiquid = false;
			this.onLiquidSurface = false;
			this.beingPushed = false;
			this.standingActors = [];
			this.standingSurface = null;
		},
		
		// Handle collision with another actor
		//	actor:			The actor that this actor collided with
		//	translation:	A vector representing the direction and distance to move in order to
		//					separate this actor from the colliding actor
		handleCollision: function(actor, translation) {
			// Don't separate if colliding actor doesn't resolve collisions
			if (!actor.resolveCollisions) { return; }
			
			// If this actor is pushable (and needs to be separated on x-axis) then move this actor
			// and reduce the pushing actor's velocity accordingly (to simulate heavy objects)
			if (this.pushable && translation.X) {
				this.beingPushed = true;
				this.velocity.X = -translation.X;
				actor.velocity.X *= 1 - this.pushFriction;
			
			// Otherwise, only separate if the colliding actor can't be moved (either non-pushable
			// or pushable but blocked from moving)
			} else if (!actor.pushable || !actor.velocity.X) {
				this.velocity = vec2.sub(this.velocity, translation);
			}
		},
		
		// Handle collision with a solid tile edge
		//	tile:		The tile position that this actor collided with
		//	tileType:	The type of tile that this actor collided with
		handleTileCollision: function(tile, tileType) { },
		draw: function(context) {
			if (this.sprite) {
				this.sprite.draw(context, this.position, this.direction);
			}
		}
	};
	
	// Register loader function
	Z.content.registerLoader("actor", _actor.load);
	
	return _actor;
}());