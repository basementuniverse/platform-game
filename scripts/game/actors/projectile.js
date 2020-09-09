Z.projectile = (function(base) {
	"use strict";
	
	var DISPOSE_DISTANCE = 100;	// Projectiles will be disposed when they go this far off-screen
	
	var _projectile = Object.create(base);
	_projectile.sourceActorType = "";	// The type of actor that created this projectile
	_projectile.power = false;			// True if this is a power projectile (apply power damage)
	_projectile.speed = 0;				// The speed of this projectile
	_projectile.direction = vec2();		// The direction of this projectile
	_projectile.damage = 0;				// The amount of damage to apply
	_projectile.powerDamage = 0;		// The amount of power damage to apply
	_projectile.distance = 0;			// The distance this projectile has travelled
	_projectile.maxDistance = 0;		// Projectile will be disposed when it has travelled
										// beyond this distance of it's initial position
	_projectile.create = function(position, sourceActorType, power, direction, data) {
		var p = base.create.call(
			this,
			"",
			"projectile",
			data.name,
			position,
			vec2(data.size),
			Z.sprite.create(data.spriteData)
		);
		p.baseType = "projectile";
		p.resolveCollisions = false;
		p.useGravity = false;
		p.sourceActorType = sourceActorType;
		p.power = !!power;
		p.direction = direction;
		p.speed = data.speed;
		p.damage = data.damage;
		p.powerDamage = data.powerDamage;
		p.distance = 0;
		p.maxDistance = data.maxDistance || 0;
		return p;
	};
	_projectile.update = function(elapsedTime) {
		// Set animation depending on power
		this.sprite.animation = this.power ? "power" : "idle";
		
		// Dispose projectile when it goes too far from the current view area
		if (
			this.position.X < Z.camera.bounds.X - DISPOSE_DISTANCE ||
			this.position.X > Z.camera.bounds.X + Z.camera.size.X + DISPOSE_DISTANCE
		) {
			this.disposed = true;
		}
		
		// Set constant velocity
		this.velocity = vec2.mul(this.direction, this.speed * elapsedTime);
		this.distance += vec2.len(this.velocity);
		
		// Dispose this projectile if it has a max distance and has exceeded this distance
		if (this.maxDistance > 0 && this.distance >= this.maxDistance) {
			this.disposed = true;
		}
		base.update.apply(this, arguments);
	};
	_projectile.handleCollision = function(actor, translation) {
		// Ignore collisions with the same type of actor that fired this projectile or powerups
		if (
			actor.baseType != this.sourceActorType &&
			actor.baseType != "powerup" &&
			actor.baseType != "projectile"
		) {
			this.disposed = true;
			
			// Deal damage to actor
			if (actor.damage) {
				actor.damage(this.power ? this.powerDamage : this.damage);
			}
		}
	};
	_projectile.handleTileCollision = function(tile, tileType) {
		// Check if the tile is solid or has a solid edge facing the projectile's direction
		if (
			tileType.solid ||
			(tileType.leftEdge && this.direction.X > 0) ||
			(tileType.rightEdge && this.direction.X < 0)
		) {
			this.disposed = true;
		}
	};
	return _projectile;
}(Z.actor));