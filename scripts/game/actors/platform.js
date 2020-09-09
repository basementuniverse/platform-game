Z.platform = (function(base) {
	"use strict";
	
	var _platform = Object.create(base);
	_platform.wayPoints = [];
	_platform.currentWayPoint = null;
	_platform.active = true;
	_platform.create = function(data) {
		var p = base.create.call(
				this,
				data.id,
				data.type,
				data.name,
				vec2(data.position),
				vec2(data.size),
				Z.sprite.create(data.spriteData)
			);
		p.baseType = "platform";
		p.useGravity = false;
		p.active = !!data.active;
		p.wayPoints = [];
		if (data.wayPoints.length) {
			// Create waypoints
			for (var i = 0, length = data.wayPoints.length; i < length; i++) {
				p.wayPoints.push({
					target: vec2(data.wayPoints[i].target),
					time: data.wayPoints[i].time
				});
			}
			
			// Set platform initial position and current waypoint (if there is more than 1)
			p.position = p.wayPoints[0].target;
			if (p.wayPoints.length > 1) {
				p.currentWayPoint = {
					index: 1,
					target: p.wayPoints[1].target,
					time: p.wayPoints[1].time,
					progress: 0
				};
			}
		}
		return p;
	};
	_platform.getData = function() {
		var data = base.getData.apply(this, arguments);
		
		// Only add platform properties if the values are different to the content type values or
		// if the content type doesn't already specify a value
		// Active
		if (
			!Z.content.items[this.type].hasOwnProperty("active") ||
			Z.content.items[this.type].active === null ||
			Z.content.items[this.type].active != this.active
		) {
			data.active = this.active;
		}
		
		// Waypoints are always overridden in instance data - the content definition for platforms
		// shouldn't define any 'default' waypoints for all platform instances
		data.wayPoints = [];
		for (var i = 0, length = this.wayPoints.length; i < length; i++) {
			data.wayPoints.push({
				target: [this.wayPoints[i].target.X, this.wayPoints[i].target.Y],
				time: this.wayPoints[i].time
			});
		}
		return data;
	};
	_platform.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.active = false;
		data.wayPoints = [];
		return data;
	};
	_platform.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Active
		properties.push({
			name: "Active",
			id: "active",
			type: Z.editorPropertyType.toggle
		});
		
		// Waypoints
		properties.push({
			name: "Waypoints",
			id: "wayPoints",
			type: Z.editorPropertyType.custom
		});
		return properties;
	};
	_platform.update = function(elapsedTime) {
		// If active and there is a waypoint to move towards, move platform
		if (this.active && this.currentWayPoint) {
			this.currentWayPoint.progress += elapsedTime / this.currentWayPoint.time;
			
			// Waypoint time has been reached, switch to next waypoint
			if (this.currentWayPoint.progress >= 1) {
				this.currentWayPoint.index = ++this.currentWayPoint.index % this.wayPoints.length;
				this.currentWayPoint.target = this.wayPoints[this.currentWayPoint.index].target;
				this.currentWayPoint.time = this.wayPoints[this.currentWayPoint.index].time;
				this.currentWayPoint.progress = 0;
			}
			
			// Lerp position from previous waypoint to current waypoint
			var previousIndex = (this.currentWayPoint.index || this.wayPoints.length) - 1,
				newPosition = Math.lerp(
					this.wayPoints[previousIndex].target,
					this.currentWayPoint.target,
					this.currentWayPoint.progress
				);
			this.velocity = vec2.sub(newPosition, this.position);
			this.sprite.animation = "active";
			
			// Set the actor direction to left/right depending on the current velocity
			this.direction = vec2(this.velocity.X < 0 ? -1 : 1, 0);
		} else {	// Otherwise stop platform and play idle animation
			this.velocity = vec2();
			this.sprite.animation = "idle";
		}
		base.update.apply(this, arguments);
	};
	_platform.handleCollision = function(actor, translation) { };
	return _platform;
}(Z.actor));