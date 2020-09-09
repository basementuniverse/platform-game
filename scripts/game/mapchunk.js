Z.mapChunk = (function() {
	"use strict";
	
	// Draw tiles into the specified context and return true if there are any drawFront tiles
	var drawTiles = function(context, tiles, tileTypes, textureAtlases, width, height, drawFront) {
		var containsDrawFrontTiles = false,
			tileType = null,
			textureOffset = null;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				tileType = tileTypes[tiles[y][x]];
				if (	// Skip blank tiles or if the texture atlas doesn't exist
					!tileType.textureAtlas ||
					!textureAtlases[tileType.textureAtlas]
				) { continue; }
				
				// Check if there are any drawFront tiles in this chunk
				if (tileType.drawFront) {
					containsDrawFrontTiles = true;
				}
				
				// Skip drawFront tiles if drawFront is false, otherwise skip non-drawFront tiles
				if (tileType.drawFront != drawFront) { continue; }
				
				// Get texture offset for the current tile and draw it
				textureOffset = vec2.mul(tileType.textureOffset, Z.settings.tileSize);
				context.drawImage(
					textureAtlases[tileType.textureAtlas],
					textureOffset.X,
					textureOffset.Y,
					Z.settings.tileSize,
					Z.settings.tileSize,
					x * Z.settings.tileSize,
					y * Z.settings.tileSize,
					Z.settings.tileSize,
					Z.settings.tileSize
				);
			}
		}
		return containsDrawFrontTiles;
	};
	
	return {
		position: vec2(),
		canvas: null,
		hasFront: false,		// True if this map chunk contains any tiles that should be drawn
								// on top of the actors layer
		canvasDrawFront: null,
		create: function(position, tiles, tileTypes, textureAtlases) {
			var m = Object.create(this),
				width = tiles[0].length,
				height = tiles.length;
			m.position = vec2.mul(position, Z.settings.tileSize * Z.settings.mapChunkSize);
			
			// Create canvas and context
			m.canvas = document.createElement("canvas");
			m.canvas.width = width * Z.settings.tileSize;
			m.canvas.height = height * Z.settings.tileSize;
			var context = m.canvas.getContext("2d");
			m.hasFront = drawTiles(context, tiles, tileTypes, textureAtlases, width, height, false);
			
			// If there are any drawFront tiles in this chunk, draw them into a separate canvas
			if (m.hasFront) {
				m.canvasDrawFront = document.createElement("canvas");
				m.canvasDrawFront.width = width * Z.settings.tileSize;
				m.canvasDrawFront.height = height * Z.settings.tileSize;
				var contextDrawFront = m.canvasDrawFront.getContext("2d");
				drawTiles(contextDrawFront, tiles, tileTypes, textureAtlases, width, height, true);
			}
			return m;
		},
		draw: function(context, drawFront) {
			context.save();
			context.translate(this.position.X, this.position.Y);
			context.drawImage(drawFront ? this.canvasDrawFront : this.canvas, 0, 0);
			context.restore();
		}
	};
}());