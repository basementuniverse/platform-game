Z.collisionOverlay = (function() {
	"use strict";
	
	// Create and return a hash map of chunks
	var generateCollisionOverlayChunks = function(mapSize, tiles, world) {
		var size = vec2.map(vec2.div(mapSize, Z.settings.mapChunkSize), Math.ceil),
			chunkPosition = null,
			chunks = [],
			chunk = null;
		for (var y = 0; y < size.Y; y++) {
			for (var x = 0; x < size.X; x++) {
				chunkPosition = vec2(x, y);
				chunk = Z.collisionOverlayChunk.create(
					chunkPosition,
					getChunkTiles(tiles, x, y),
					world.tileTypes
				);
				chunks[chunkHash(chunkPosition, false)] = chunk;
			}
		}
		return chunks;
	};
	
	// Get a list of tile row arrays for the specified chunk
	var getChunkTiles = function(tiles, chunkX, chunkY) {
		var chunk = [],
			startX = chunkX * Z.settings.mapChunkSize,
			endX = (chunkX + 1) * Z.settings.mapChunkSize,
			startY = chunkY * Z.settings.mapChunkSize,
			endY = (chunkY + 1) * Z.settings.mapChunkSize;
		for (var y = startY; y < endY && y < tiles.length; y++) {
			chunk.push(tiles[y].slice(startX, Math.min(endX, tiles[y].length)));
		}
		return chunk;
	};
	
	// Return a chunk hash code for the specified position
	var chunkHash = function(position) {
		return position.X + "_" + position.Y;
	};
	
	return {
		chunks: [],			// A list of collision overlay chunks, indexed by position
		initialise: function(map) {
			// Clear current chunks and build a new list of chunks
			this.chunks = generateCollisionOverlayChunks(map.size, map.tiles, map.world);
		},
		
		// Draw currently visible collision overlay chunks
		//	context:	The context to draw onto
		draw: function(context) {
			var start = vec2.map(
					vec2.div(Z.camera.bounds, Z.settings.tileSize * Z.settings.mapChunkSize),
					Math.floor
				),
				end = vec2.map(
					vec2.div(
						vec2.add(Z.camera.bounds, Z.camera.size),
						Z.settings.tileSize * Z.settings.mapChunkSize
					),
					Math.ceil
				),
				chunk = null;
			for (var y = start.Y; y < end.Y; y++) {	// Draw visible map chunks
				for (var x = start.X; x < end.X; x++) {
					if (chunk = this.chunks[chunkHash(vec2(x, y))]) {
						chunk.draw(context);
					}
				}
			}
		}
	};
}());