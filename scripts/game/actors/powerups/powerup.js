Z.powerup = (function(base) {
	"use strict";
	
	var _powerup = Object.create(base);
	_powerup.pickup = null;
	_powerup.expire = null;
	_powerup.time = 0;
	_powerup.points = 0;
	_powerup.create = function(data, pickup, expire) {
		var p = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		p.baseType = "powerup";
		p.resolveCollisions = false;
		p.pickup = pickup;
		p.expire = expire;
		p.time = data.time || null;
		p.points = data.points || 0;
		return p;
	};
	_powerup.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add powerup properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		// Points
		if (
			this.points && (
				!Z.content.items[this.type].hasOwnProperty("points") ||
				Z.content.items[this.type].points === null ||
				Z.content.items[this.type].points != this.points
			)
		) {
			data.points = this.points;
		}
		return data;
	};
	_powerup.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.points = null;		// Will use the value defined in content when null
		return data;
	};
	_powerup.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Points
		properties.push({
			name: "Points",
			id: "points",
			type: Z.editorPropertyType.number,
			round: true
		});
		return properties;
	};
	_powerup.handleCollision = function(actor, translation) {
		if (actor.baseType == "player") {
			this.disposed = true;
			
			// Add points to the player
			Z.player.addPoints(this.points);
			
			// Apply powerup pickup effect
			if (this.pickup) {
				this.pickup();
			}
			
			// If this powerup has an expiry effect, add an update function to the player
			if (this.expire) {
				// Create a function to count the expiry time and apply the expire effect for this
				// powerup when the expiry time reaches 0 (if there is an expire timeout)
				var time = this.time,
					totalTime = this.time,
					checkTime = time > 0,
					expire = this.expire,
					type = this.type;
				Z.player.addPowerup(
					this.type,
					this.sprite,
					function(elapsedTime, expireImmediately) {
						time -= elapsedTime;
						
						// Update this powerup's time property (normalised)
						Z.player.powerups[type].time = time / totalTime;
						
						// Check if this powerup has expired
						if ((checkTime && time <= 0) || expireImmediately) {
							expire();
							
							// Remove this powerup from the player
							delete Z.player.powerups[type];
						}
					}
				);
			}
		}
	};
	return _powerup;
}(Z.actor));