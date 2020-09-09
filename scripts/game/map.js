Z.map = (function() {
	"use strict";
	
	// Decode RLE tile data into an array of tile types
	var decode = function(data) {
		var result = [];
		for (var i = 0, length = data.length; i < length; i++) {
			if (data[i] instanceof Array) {
				for (var j = 0, runLength = data[i][0]; j < runLength; j++) {
					result.push(data[i][1]);
				}
			} else {
				result.push(data[i]);
			}
		}
		return result;
	};
	
	// Split an array of tiles into rows
	var splitRows = function(tiles, size) {
		// Check dimensions
		if (size.X * size.Y != tiles.length) {
			console.error("Error building map: tiles array length doesn't match map dimensions.");
			return false;
		}
		var result = [];
		for (var i = 0; i < size.Y; i++) {
			result.push(tiles.slice(i * size.X, (i + 1) * size.X));
		}
		return result;
	};
	
	// Create and return a hash map of chunks
	var generateMapChunks = function(mapSize, tiles, world) {
		var size = vec2.map(vec2.div(mapSize, Z.settings.mapChunkSize), Math.ceil),
			chunkPosition = null,
			chunks = [],
			chunk = null;
		for (var y = 0; y < size.Y; y++) {
			for (var x = 0; x < size.X; x++) {
				chunkPosition = vec2(x, y);
				chunk = Z.mapChunk.create(
					chunkPosition,
					getChunkTiles(tiles, x, y),
					world.tileTypes,
					world.textureAtlases
				);
				chunks[chunkHash(chunkPosition, false)] = chunk;
				
				// If this chunk contains any drawFront tiles, add the chunk under a different hash
				if (chunk.hasFront) {
					chunks[chunkHash(chunkPosition, true)] = chunk;
				}
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
	var chunkHash = function(position, drawFront) {
		return position.X + "_" + position.Y + (drawFront ? "_f" : "");
	};
	
	// Add input entities to the specified entity 
	var initialiseEntityInputs = function(entity, entities) {
		for (var i = entity.inputIds.length; i--;) {
			if (entities[entity.inputIds[i]]) {
				entity.inputs.push(entities[entity.inputIds[i]]);
			}
		}
	};
	
	// Draw map chunks that are within the currently visible area
	//	context:	The context to draw into
	//	chunks:		A hash map of chunks, indexed by position
	//	drawFront:	If true only draw front chunks, otherwise draw non-front chunks
	var drawChunks = function(context, chunks, drawFront) {
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
				if (chunk = chunks[chunkHash(vec2(x, y), drawFront)]) {
					chunk.draw(context, drawFront);
				}
			}
		}
	};
	
	var _map = {
		world: null,
		id: "",
		name: "",
		size: vec2(),
		playerStartingPosition: vec2(),
		persistent: false,	// True if this map retains actor/entity state between transitions
		tiles: [],			// An array of tile rows (each row is an array of tile type indices)
		dirty: false,		// True if any tiles or properties have been modified in the editor
		chunks: [],			// A list of map chunks, indexed by position (and drawFront)
		background: null,	// The background definition for this map
		actors: [],			// List of actors in this map
		actorsById: [],		// List of actors, indexed by id
		entities: [],		// List of entities in this map
		entitiesById: [],	// List of entities, indexed by id
		lights: [],			// List of lights in this map
		lightsById: [],		// List of lights, indexed by id
		create: function(world, id, data) {
			var m = Object.create(this);
			m.world = world;
			m.id = id;
			m.name = data.name;
			m.size = vec2(data.size);										// Required
			m.playerStartingPosition = vec2(data.playerStartingPosition);	// Required
			m.persistent = !!data.persistent;								// Required
			m.tiles = splitRows(decode(data.tiles), m.size);				// Required
			m.actors = [];
			m.actorsById = [];
			m.entities = [];
			m.entitiesById = [];
			m.lights = [];
			m.lightsById = [];
			
			// Create map chunks
			m.chunks = generateMapChunks(m.size, m.tiles, m.world);
			
			// If using the editor, build the collision overlay
			if (Z.editor && Z.collisionOverlay) {
				Z.collisionOverlay.initialise(m);
			}
			
			// Initialise actor instances
			var actor = null;
			for (var i = data.actors.length; i--;) {
				if (actor = Z.actorFactory.create(data.actors[i])) {
					m.actors.push(actor);
					
					// If this actor has an id, add it to the map's id-indexed actors list
					if (actor.id) {
						m.actorsById[actor.id] = actor;
					}
				}
			}
			
			// Initialise entity instances
			var entity = null;
			for (var i = data.entities.length; i--;) {
				if (entity = Z.entityFactory.create(data.entities[i])) {
					m.entities.push(entity);
					
					// If this entity has an id, keep track of it so inputs can be added later
					if (entity.id) {
						m.entitiesById[entity.id] = entity;
					}
				}
			}
			
			// Initialise entity inputs
			for (var i = m.entities.length; i--;) {
				initialiseEntityInputs(m.entities[i], m.entitiesById);
			}
			
			// Initialise light instances
			var light = null;
			for (var i = data.lights.length; i--;) {
				if (light = Z.lightFactory.create(data.lights[i])) {
					m.lights.push(light);
					
					// If this light has an id, add it to the map's id-indexed lights list
					if (light.id) {
						m.lightsById[light.id] = light;
					}
				}
			}
			
			// Initialise background
			m.background = Z.background.create(data.background);
			return m;
		},
		load: function(callback, path, data) {
			Z.utilities.loadData(function(mapData) {
				callback(mapData);
			}, path, data);
		},
		dispose: function() {
			// Clear map chunks
			this.chunks = [];
			
			// Clear actors and entities
			this.actors = [];
			this.actorsById = [];
			this.entities = [];
			this.entitiesById = [];
			this.lights = [];
			this.lightsById = [];
		},
		generateMapChunks: function() {
			return generateMapChunks(this.size, this.tiles, this.world);
		},
		update: function(elapsedTime) {
			// Remove disposed actors
			this.actors = this.actors.filter(function(a) { return !a.disposed; });
			
			// Update actors
			for (var i = this.actors.length; i--;) {
				this.actors[i].update(elapsedTime);
				
				// Check actor/tile collisions
				Z.collision.checkTiles(this.actors[i], this);
				
				// Integrate velocity
				this.actors[i].position = vec2.add(
					this.actors[i].position,
					this.actors[i].velocity
				);
				
				// Round position to 2 decimal places (this fixes some collision problems)
				this.actors[i].position = vec2.div(vec2.map(
					vec2.mul(this.actors[i].position, 100),
					Math.round
				), 100);
			}
			
			// Check actor/actor collisions
			var collisions = [],
				collision = null;
			for (var i = 0, length = this.actors.length; i < length; i++) {
				for (var j = i + 1; j < length; j++) {
					if (collision = Z.collision.checkActors(this.actors[i], this.actors[j])) {
						collisions.push(collision);
					}
				}
			}
			for (var i = collisions.length; i--;) {	// Resolve actor/actor collisions
				collisions[i]();
			}
			
			// Update entities
			for (var i = this.entities.length; i--;) {
				this.entities[i].update(elapsedTime);
			}
			
			// Update lightmap
			Z.lightMap.update(elapsedTime, this.lights);
		},
		
		// Draw the map background, tile layers and actors
		//	context:	The context to draw onto
		//	editor:		True if currently in the editor (will also check if certain elements are
		//				currently hidden/visible)
		draw: function(context, editor) {
			// Draw background layer
			if (!editor || Z.editor.show.background) {
				this.background.draw(context);
			}
			
			// Draw non-drawFront map tiles (underneath actors layer)
			drawChunks(context, this.chunks, false);
			
			// Draw actors
			if (!editor || Z.editor.show.actors) {
				for (var i = this.actors.length; i--;) {
					this.actors[i].draw(context);
				}
			}
			
			// Draw drawFront map tiles (on top of actors layer)
			drawChunks(context, this.chunks, true);
			
			// Draw lightmap
			if (!editor || Z.editor.show.lighting) {
				Z.lightMap.draw(context, this.lights);
			}
			
			// Draw entities
			if (editor && Z.editor.show.entities) {
				for (var i = this.entities.length; i--;) {
					this.entities[i].draw(context);
				}
				
				// Draw entity labels in a separate pass (so labels appear on top)
				for (var i = this.entities.length; i--;) {
					this.entities[i].drawLabel(context);
				}
			}
			
			// Draw light tools (point and spot lights only)
			if (editor && Z.editor.show.lighting) {
				for (var i = this.lights.length; i--;) {
					if (this.lights[i].type == "ambient") { continue; }
					this.lights[i].drawTool(context);
				}
			}
		}
	};
	
	// Register loader function
	Z.content.registerLoader("map", _map.load);
	
	return _map;
}());

// Empty map definition (used by editor when creating a new map)
Z.map.empty = function() {
	return {
		name: "Untitled Map",
		size: [1, 1],
		playerStartingPosition: [0, 0],
		persistent: false,
		tiles: [0],
		background: Z.background.empty(),
		actors: [],
		entities: [],
		lights: [{
			type: "ambient",
			id: "defaultlight",
			direction: [0, 1],
			brightness: 1,
			colour: "rgba(255, 255, 255, 1)",
			castShadows: false,
			active: true
		}]
	};
};