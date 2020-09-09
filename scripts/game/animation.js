Z.animation = (function() {
	"use strict";
	
	return {
		sprite: null,
		name: "",
		frames: 0,
		frame: 0,
		frameTime: 0,
		frameRate: 1,
		loop: true,
		directions: true,
		startOffset: vec2(),
		barrelOffset: vec2(),		// Barrel offset position (from top left of sprite tile)
		finishedCallback: null,		// A function to run when the current animation finishes
		create: function(sprite, data) {
			var a = Object.create(this);
			a.sprite = sprite;
			a.name = data.name;						// Required
			a.frames = data.frames || a.frames;
			a.frameRate = data.frameRate || a.frameRate;
			a.frameTime = 1 / a.frameRate;
			a.loop = !!data.loop;
			a.directions = !!data.directions;
			a.startOffset = vec2(data.startOffset);	// Required
			
			// Check if this animation has a barrel offset position (for firing projectiles)
			if (data.barrelOffset) {
				a.barrelOffset = vec2(data.barrelOffset);
			}
			return a;
		},
		
		// Update the animation frame
		update: function(elapsedTime) {
			if (!this.frames) { return; }
			if (this.frameTime <= 0) {
				this.frameTime = 1 / this.frameRate;
				if (this.frame < this.frames - 1) {
					this.frame++;
				} else {
					if (this.loop) {	// Reset looping animations back to frame 0
						this.frame = 0;
					} else if (this.finishedCallback) {
						// For non-looping animations, check if there is a callback and run it
						this.finishedCallback();
						this.finishedCallback = null;
					}
				}
			}
			this.frameTime = Math.max(this.frameTime - elapsedTime, 0);
		},
		
		// Draw the current animation frame onto the specified context
		draw: function(context, position, direction) {
			// Get frame offset for the current animation and frame
			var frameOffset = vec2.mul(
					vec2.add(this.startOffset, vec2(this.frame, 0)),
					this.sprite.tileSize
				);
			
			// Draw the animation frame at the actor position + offset
			context.save();
			context.translate(
				position.X + this.sprite.actorOffset.X,
				position.Y + this.sprite.actorOffset.Y
			);
			
			// If this animation has directions, flip image according to actor direction
			if (this.directions && direction.X < 0) {
				context.translate(this.sprite.tileSize.X, 0);
				context.scale(-1, 1);
			}
			context.drawImage(
				this.sprite.image,
				frameOffset.X, frameOffset.Y,
				this.sprite.tileSize.X, this.sprite.tileSize.Y,
				0, 0,
				this.sprite.tileSize.X, this.sprite.tileSize.Y
			);
			context.restore();
		}
	};
}());