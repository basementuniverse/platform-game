Z.sprite = (function() {
	"use strict";
	
	var _sprite = {
		image: null,
		tileSize: vec2(),			// Size of each sprite sheet tile
		actorOffset: vec2(),		// Tile offset from actor position
		animations: [],
		animation: "idle",			// Default animation is always "idle"
		previousAnimation: "",		// Previously played animation (used when animation changes)
		create: function(data) {
			var s = Object.create(this);
			s.image = data.image;						// Required
			s.tileSize = vec2(data.tileSize);			// Required
			s.actorOffset = vec2(data.actorOffset);		// Required
			
			// Create sprite animations
			var animations = [];
			for (var i = 0, length = data.animations.length; i < length; i++) {
				animations[data.animations[i].name] = Z.animation.create(s, data.animations[i]);
			}
			s.animations = animations;
			return s;
		},
		
		// Loads sprite data and spritesheet image
		load: function(callback, path, data) {
			Z.utilities.loadData(function(spriteData) {
				Z.utilities.loadImage(function(image) {
					spriteData.image = image;
					callback(spriteData);
				}, spriteData.imagePath);
			}, path, data);
		},
		update: function(elapsedTime) {
			// If animation has changed, reset to frame 0
			if (this.animation != this.previousAnimation) {
				this.animations[this.animation].frame = 0;
				this.previousAnimation = this.animation;
			}
			
			// Update current animation
			if (this.animations[this.animation]) {
				this.animations[this.animation].update(elapsedTime);
			}
		},
		draw: function(context, position, direction) {
			if (this.image && this.animations[this.animation]) {
				this.animations[this.animation].draw(context, position, direction);
			}
		}
	};
	
	// Register loader function
	Z.content.registerLoader("sprite", _sprite.load);
	
	return _sprite;
}());