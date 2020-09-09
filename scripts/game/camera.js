Z.camera = (function() {
	"use strict";
	
	var EASE_AMOUNT = 0.25,				// How fast the camera eases towards the target position
		ACTOR_AREA = 30,				// Buffer area around the target actor
		TARGET_AREA = vec2(120, 120);	// Buffer around the current position
	
	return {
		targetActor: null,
		targetPosition: vec2(),
		position: vec2(),
		offset: vec2(),					// Camera position offset (used for camera shake effect)
		size: vec2(),
		bounds: vec2(),
		
		// Locks the camera onto a target actor and initialises the camera position
		//	actor:			The target actor to follow
		//	resetPosition:	If true, re-center the camera on the actor (if this is false then wait
		//					until update to check if target is outside the target area)
		initialise: function(actor, resetPosition) {
			this.targetActor = actor;
			if (resetPosition) {
				this.targetPosition = actor.position;
				this.position = actor.position;
			}
			
			// Reset offset
			this.offset = vec2();
		},
		update: function(context, width, height) {
			var smallScreen = false,
				targetSize = this.targetActor.size,
				targetArea = vec2.div(vec2.mul(TARGET_AREA, 2), Z.settings.scale),
				targetDelta = vec2.sub(this.targetActor.position, this.targetPosition),
				moveAmount = vec2();
			
			// Check if the screen size is smaller than the target area
			if (width < TARGET_AREA.X * 2 || height < TARGET_AREA.Y * 2) {
				smallScreen = true;
			}
			
			// Scale screen size
			width /= Z.settings.scale;
			height /= Z.settings.scale;
			
			// Make sure the target area is smaller than the current screen size and contains the
			// target actor (with some space around the actor)
			targetArea.X = Math.clamp(targetArea.X, 0, width / 2 - (targetSize.X + ACTOR_AREA));
			targetArea.Y = Math.clamp(targetArea.Y, 0, height / 2 - (targetSize.Y + ACTOR_AREA));
			
			// If the screen is smaller than the target area, follow the target actor directly
			if (smallScreen) {
				this.targetPosition = vec2(this.targetActor.position);
			} else {
				// If the target actor is outside the target area, move the camera
				if (Math.abs(targetDelta.X) > targetArea.X) {
					moveAmount.X += targetDelta.X > 0 ? targetArea.X : -targetArea.X;
					this.targetPosition.X += targetDelta.X - moveAmount.X;
				}
				if (Math.abs(targetDelta.Y) > targetArea.Y) {
					moveAmount.Y += targetDelta.Y > 0 ? targetArea.Y : -targetArea.Y;
					this.targetPosition.Y += targetDelta.Y - moveAmount.Y;
				}
			}
			
			// Get difference between current and target position and ease towards target
			var positionDelta = vec2.sub(vec2.add(this.targetPosition, this.offset), this.position);
			this.position = vec2.add(this.position, vec2.mul(positionDelta, EASE_AMOUNT));
			
			// Get the screen size and camera bounds in world coords
			this.size = vec2(width, height);
			this.bounds = vec2.sub(this.position, vec2.div(this.size, 2));
			
			// Translate context to camera position and set scale
			var translate = vec2.map(
				vec2.sub(
					vec2.div(this.size, 2 / Z.settings.scale),
					vec2.mul(this.position, Z.settings.scale)
				),
				Math.floor
			);
			context.setTransform(
				Z.settings.scale,
				0, 0,
				Z.settings.scale,
				translate.X, translate.Y
			);
		}
	};
}());