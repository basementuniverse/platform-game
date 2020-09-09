Z.block = (function(base) {
	"use strict";
	
	var HEAVY_PUSH_FRICTION = 0.8;		// Use this push friction amount if the block is heavy
	
	var _block = Object.create(base);
	_block.floats = false;
	_block.health = 0;
	_block.destructible = false;
	_block.create = function(data) {
		var b = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		b.baseType = "block";
		b.pushable = !!data.pushable;
		b.useGravity = b.pushable;
		b.pushFriction = data.heavy ? HEAVY_PUSH_FRICTION : 0;
		b.floats = !!data.floats;
		b.health = data.health || 0;
		b.destructible = b.health > 0;
		return b;
	};
	_block.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add block properties if the values are different to the content type values or if
		// the content type doesn't already specify a value
		// Pushable
		if (
			!Z.content.items[this.type].hasOwnProperty("pushable") ||
			Z.content.items[this.type].pushable === null ||
			Z.content.items[this.type].pushable != this.pushable
		) {
			data.pushable = this.pushable;
		}
		
		// Heavy
		if (
			!Z.content.items[this.type].hasOwnProperty("heavy") ||
			Z.content.items[this.type].heavy === null ||
			Z.content.items[this.type].heavy != this.heavy
		) {
			data.heavy = this.heavy;
		}
		
		// Floats
		if (
			!Z.content.items[this.type].hasOwnProperty("floats") ||
			Z.content.items[this.type].floats === null ||
			Z.content.items[this.type].floats != this.floats
		) {
			data.floats = this.floats;
		}
		
		// Health
		if (
			!Z.content.items[this.type].hasOwnProperty("health") ||
			Z.content.items[this.type].health === null ||
			Z.content.items[this.type].health != this.health
		) {
			data.health = this.health;
		}
		return data;
	};
	_block.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.pushable = null;	// Will use the value defined in content when null
		data.heavy = null;
		data.floats = null;
		data.health = null;
		return data;
	};
	_block.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Pushable
		properties.push({
			name: "Pushable",
			id: "pushable",
			type: Z.editorPropertyType.toggle
		});
		
		// Heavy
		properties.push({
			name: "Heavy",
			id: "heavy",
			type: Z.editorPropertyType.toggle
		});
		
		// Floats
		properties.push({
			name: "Floats",
			id: "floats",
			type: Z.editorPropertyType.toggle
		});
		
		// Health
		properties.push({
			name: "Health",
			id: "health",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 10,
			round: true
		});
		return properties;
	};
	_block.update = function(elapsedTime) {
		// If this block floats and is in liquid, apply upwards velocity (reverse liquid gravity)
		// multiplied by 2 (base actor update will apply liquid gravity, so this will negate it)
		if (this.inLiquid && this.floats) {
			this.velocity.Y = -Z.settings.liquidGravity * 2;
		}
		
		// Don't allow non-pushable blocks to move
		if (!this.pushable) {
			this.velocity = vec2();
		}
		base.update.apply(this, arguments);
	};
	_block.handleCollision = function(actor, translation) {
		if (actor.baseType == "door") {	// Make sure blocks cannot be pushed through doors
			this.position.X -= translation.X;
			this.velocity.X = 0;
		} else {
			base.handleCollision.apply(this, arguments);
		}
	};
	
	// Apply the specified amount of damage to this block (and destroy if health goes below 0)
	_block.damage = function(amount) {
		// Ignore damage if this block is indestructible
		if (!this.destructible) { return; }
		
		// Apply damage
		this.health -= amount;
		
		// If health is reduced to 1, change to the damaged animation
		this.sprite.animation = "damaged";
		
		// Check if the block has been destroyed
		if (this.health <= 0) {
			this.die();
		}
	};
	
	// Start playing the destroy animation and dispose the block when finished
	_block.die = function() {
		// Ignore death if this block is indestructible
		if (!this.destructible) { return; }
		
		// Play the destroy animation
		this.sprite.animation = "destroy";
		var b = this;
		this.sprite.animations["destroy"].finishedCallback = function() {
			b.disposed = true;
		};
		
		// Remove collisions
		this.collideActors = false;
	};
	return _block;
}(Z.actor));