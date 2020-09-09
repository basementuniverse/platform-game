Z.background = (function() {
	"use strict";
	
	return {
		colour: "",
		image: null,
		imageId: "",
		imageSize: vec2(),
		offset: vec2(),
		repeatX: false,
		repeatY: false,
		parallax: vec2(),
		pattern: null,
		create: function(data) {
			var b = Object.create(this);
			b.colour = data.colour;
			
			// If there is a background image, get the image from the world and get it's dimensions
			if (data.backgroundImageId) {
				b.image = Z.world.backgroundImages[data.backgroundImageId];
				b.imageSize = vec2(b.image.width, b.image.height);
				
				// Save image id (for use in the editor)
				b.imageId = data.backgroundImageId;
			}
			b.offset = vec2(data.offset);
			b.repeatX = !!data.repeatX;
			b.repeatY = !!data.repeatY;
			
			// If background image is repeating, make sure image offset is less than image size
			// (this returns proper results from negative offsets due to how js modulo works)
			if (b.image && b.repeatX) {
				b.offset.X %= b.imageSize.X;
			}
			if (b.image && b.repeatY) {
				b.offset.Y %= b.imageSize.Y;
			}
			b.parallax = vec2(data.parallax);
			return b;
		},
		getData: function() {
			return {
				colour: this.colour,
				offset: [this.offset.X, this.offset.Y],
				backgroundImageId: this.imageId,
				repeatX: this.repeatX,
				repeatY: this.repeatY,
				parallax: [this.parallax.X, this.parallax.Y]
			};
		},
		draw: function(context) {
			// Draw background colour
			context.save();
			context.fillStyle = this.colour;
			context.translate(Z.camera.bounds.X, Z.camera.bounds.Y);
			context.fillRect(0, 0, Z.camera.size.X, Z.camera.size.Y);
			context.restore();
			
			// Draw background image if one exists
			if (this.image) {
				context.save();
				
				// Use parallax amounts to modify offset position from current camera position
				var parallaxOffset = vec2.add(
					this.offset,
					vec2.mul(Z.camera.position, this.parallax)
				);
				
				// Use canvas pattern to draw repeating background images
				if (this.repeatX || this.repeatY) {
					if (!this.pattern) {	// Create a pattern if one doesn't already exist
						var repeat = "repeat";
						if (!this.repeatX) {
							repeat = "repeat-y";
						} else if (!this.repeatY) {
							repeat = "repeat-x";
						}
						this.pattern = context.createPattern(this.image, repeat);
					}
					context.fillStyle = this.pattern;
					
					// Calculate pattern start offset from current camera position
					var start = vec2.sub(Z.camera.bounds, parallaxOffset);
					context.save();
					context.translate(parallaxOffset.X, parallaxOffset.Y);
					context.fillRect(start.X, start.Y, Z.camera.size.X, Z.camera.size.Y);
					context.restore();
					
				// Use drawImage to draw non-repeating background image
				} else {
					var a = { tl: parallaxOffset, br: vec2.add(parallaxOffset, this.imageSize) },
						b = { tl: Z.camera.bounds, br: vec2.add(Z.camera.bounds, Z.camera.size) },
						interval = vec2(
							a.tl.X < b.tl.X ? b.tl.X - a.br.X : a.tl.X - b.br.X,
							a.tl.Y < b.tl.Y ? b.tl.Y - a.br.Y : a.tl.Y - b.br.Y
						);
					
					// Only draw background image if it within the current view area
					if (interval.X < 0 && interval.Y < 0) {
						context.drawImage(this.image, parallaxOffset.X, parallaxOffset.Y);
					}
				}
				context.restore();
			}
		}
	};
}());

// Empty background definition (used by editor when creating a new map)
Z.background.empty = function() {
	return {
		colour: "rgba(0, 0, 0, 1)",
		offset: [0, 0],
		backgroundImageId: "",
		repeatX: false,
		repeatY: false,
		parallax: [0, 0]
	};
};