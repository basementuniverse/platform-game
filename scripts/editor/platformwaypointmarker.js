Z.platformWayPointMarker = (function(base) {
	"use strict";
	
	var COLOUR = "rgba(255, 255, 255, 0.3)",
		LINE_WIDTH = 1;
	
	var _platformWayPointMarker = Object.create(base);
	_platformWayPointMarker.platform = null;
	_platformWayPointMarker.wayPoint = null;
	_platformWayPointMarker.wayPointIndex = 0;
	_platformWayPointMarker.create = function(id, platform, wayPoint, index) {
		var p = base.create.call(this, id, wayPoint.target);
		p.type = "platformwaypoint";
		p.platform = platform;
		p.wayPoint = wayPoint;
		p.wayPointIndex = index;
		return p;
	};
	_platformWayPointMarker.handleDrag = function(selection) {
		Z.entity.handleDrag.apply(this, arguments);
		this.platform.wayPoints[this.wayPointIndex].target = vec2(this.position);
	};
	_platformWayPointMarker.handleMove = function(moveVector) {
		Z.entity.handleMove.apply(this, arguments);
		this.platform.wayPoints[this.wayPointIndex].target = vec2(this.position);
	};
	_platformWayPointMarker.draw = function(context) {
		var image = Z.content.items["platformwaypointicon"],
			height = image.height,
			width = image.width,
			position = vec2.mul(this.position, Z.settings.scale);
		
		// Draw a line to the previous waypoint or platform
		var previousPosition = this.platform.position;
		if (this.wayPointIndex > 1) {
			previousPosition = this.platform.wayPoints[this.wayPointIndex - 1].target;
		}
		context.save();
		context.strokeStyle = COLOUR;
		context.lineWidth = LINE_WIDTH;
		context.moveTo(this.position.X, this.position.Y);
		context.lineTo(previousPosition.X, previousPosition.Y);
		context.stroke();
		context.closePath();
		context.restore();
		
		// Use standard scale when drawing the icon
		context.save();
		context.scale(1 / Z.settings.scale, 1 / Z.settings.scale);
		context.translate(position.X - width / 2, position.Y - height / 2);
		context.drawImage(image, 0, 0, width, height);
		context.restore();
	};
	return _platformWayPointMarker;
}(Z.entity));