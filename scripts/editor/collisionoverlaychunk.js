Z.collisionOverlayChunk = (function() {
	"use strict";
	
	var SOLID_COLOUR = "rgba(255, 255, 0, 0.5)",
		EDGE_COLOUR = "rgb(255, 255, 0)",
		EDGE_WIDTH = 2,
		LIQUID_COLOUR = "rgba(0, 0, 255, 0.5)",
		LADDER_COLOUR = "rgba(255, 0, 255, 0.5)";
	
	// Draw tiles into the specified context
	var drawTiles = function(context, tiles, tileTypes, width, height) {
		var tileType = null,
			size = Z.settings.tileSize;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				tileType = tileTypes[tiles[y][x]];
				
				// Draw a collision overlay for the current tile
				context.save();
				if (tileType.solid) {
					context.fillStyle = SOLID_COLOUR;
					context.fillRect(x * size, y * size, size, size);
				} else if (tileType.liquid) {
					context.fillStyle = LIQUID_COLOUR;
					context.fillRect(x * size, y * size, size, size);
				} else if (tileType.ladder) {
					context.fillStyle = LADDER_COLOUR;
					context.fillRect(x * size, y * size, size, size);
				} else {	// Draw enabled edges
					context.strokeStyle = EDGE_COLOUR;
					context.lineWidth = EDGE_WIDTH;
					if (tileType.topEdge) {
						context.beginPath();
						context.moveTo(x * size, y * size);
						context.lineTo((x + 1) * size, y * size);
						context.stroke();
						context.closePath();
					}
					if (tileType.bottomEdge) {
						context.beginPath();
						context.moveTo(x * size, (y + 1) * size);
						context.lineTo((x + 1) * size, (y + 1) * size);
						context.stroke();
						context.closePath();
					}
					if (tileType.rightEdge) {
						context.beginPath();
						context.moveTo((x + 1) * size, y * size);
						context.lineTo((x + 1) * size, (y + 1) * size);
						context.stroke();
						context.closePath();
					}
					if (tileType.leftEdge) {
						context.beginPath();
						context.moveTo(x * size, y * size);
						context.lineTo(x * size, (y + 1) * size);
						context.stroke();
						context.closePath();
					}
				}
				context.restore();
			}
		}
	};
	
	return {
		position: vec2(),
		canvas: null,
		create: function(position, tiles, tileTypes) {
			var m = Object.create(this),
				width = tiles[0].length,
				height = tiles.length;
			m.position = vec2.mul(position, Z.settings.tileSize * Z.settings.mapChunkSize);
			
			// Create canvas and context
			m.canvas = document.createElement("canvas");
			m.canvas.width = width * Z.settings.tileSize;
			m.canvas.height = height * Z.settings.tileSize;
			var context = m.canvas.getContext("2d");
			drawTiles(context, tiles, tileTypes, width, height);
			return m;
		},
		draw: function(context) {
			context.save();
			context.translate(this.position.X, this.position.Y);
			context.drawImage(this.canvas, 0, 0);
			context.restore();
		}
	};
}());