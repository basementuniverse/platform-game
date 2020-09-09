Z.mapFunctions = (function() {
	"use strict";
	
	// Add editor-specific methods to the map object when all scripts have finished loading
	$(document).ready(function() {
		var _drawingTiles = false,	// True if currently modifying the map's tiles
			_mapSnapshots = [];		// A stack of map snapshots (used for tile edit actions)
		
		// Encode an array of tile types into an RLE array
		var encode = function(tiles) {
			var i = 1,
				length = tiles.length,
				result = [],
				currentRun = [tiles[0]];
			while (i < length) {
				if (tiles[i] == currentRun[0]) {
					currentRun.push(tiles[i]);
				} else {
					result.push(
						currentRun.length > 1 ? [currentRun.length, currentRun[0]] : currentRun[0]
					);
					currentRun = [tiles[i]];
				}
				i++;
			}
			result.push([currentRun.length, currentRun[0]]);
			return result;
		};
		
		// Join an array of tile rows into a single array
		var joinRows = function(tiles) {
			var result = [];
			for (var i = 0, length = tiles.length; i < length; i++) {
				result.push.apply(result, tiles[i]);
			}
			return result;
		};
		
		// Return a snapshot of the specified map's tiles and dimensions, and an id-indexed list of
		// copies of actor, entity and light positions
		var getSnapshot = function(map) {
			var snapshot = {
				size: vec2(map.size),
				tiles: [],
				actorPositions: [],
				entityPositions: [],
				lightPositions: []
			};
			
			// Make a copy of the map's current tiles
			var row = null;
			for (var y = 0; y < map.size.Y; y++) {
				row = [];
				for (var x = 0; x < map.size.X; x++) {
					row.push(map.tiles[y][x]);
				}
				snapshot.tiles.push(row);
			}
			
			// Store actor positions indexed by actor id
			for (var i = map.actors.length; i--;) {
				snapshot.actorPositions[map.actors[i].id] = vec2(map.actors[i].position);
			}
			
			// Store entity positions indexed by entity id
			for (var i = map.entities.length; i--;) {
				snapshot.entityPositions[map.entities[i].id] = vec2(map.entities[i].position);
			}
			
			// Store light positions indexed by light id
			for (var i = map.lights.length; i--;) {
				if (map.lights[i].position) {
					snapshot.lightPositions[map.lights[i].id] = vec2(map.lights[i].position);
				}
			}
			return snapshot;
		};
		
		// Set the specified map's dimensions and tiles to the values in the specified snapshot,
		// and update actor, entity and light positions to those stored in the specified snapshot
		var setSnapshot = function(map, snapshot) {
			var offset = vec2.mul(vec2.sub(snapshot.size, map.size), Z.settings.tileSize);
			map.size = snapshot.size;
			map.tiles = snapshot.tiles;
			
			// Update actor positions
			for (var i = map.actors.length; i--;) {
				if (snapshot.actorPositions[map.actors[i].id]) {
					map.actors[i].position = snapshot.actorPositions[map.actors[i].id];
				}
			}
			
			// Update entity positions
			for (var i = map.entities.length; i--;) {
				if (snapshot.entityPositions[map.entities[i].id]) {
					map.entities[i].position = snapshot.entityPositions[map.entities[i].id];
				}
			}
			
			// Update light positions
			for (var i = map.lights.length; i--;) {
				if (snapshot.lightPositions[map.lights[i].id]) {
					map.lights[i].position = snapshot.lightPositions[map.lights[i].id];
				}
			}
			
			// Re-position the camera if the map size has changed
			Z.camera.position = vec2.add(Z.camera.position, offset);
			
			// Rebuild map chunks and the collision overlay
			map.chunks = map.generateMapChunks();
			Z.collisionOverlay.initialise(map);
		};
		
		
		// Set a tile position to a tile type in the specified map and resize the map to fit all
		// populated tiles
		var setTile = function(map, position, tileType) {
			// Don't try to remove tiles outside the map bounds (these tiles are considered empty)
			var outside = (
				position.X < 0 || position.X >= map.size.X ||
				position.Y < 0 || position.Y >= map.size.Y
			);
			if (tileType == "0" && outside) { return; }
			
			// If setting a tile outside the map bounds, resize the map
			var tileOffset = vec2(),
				pixelOffset = null,
				newPosition = null,
				resized = false;
			if (outside) {
				tileOffset = resize(map, position, false);
				resized = true;
			}
			
			// If the tile at the target position doesn't already contain the specified tile type, 
			// update the tile
			newPosition = vec2.sub(position, tileOffset);
			if (map.tiles[newPosition.Y][newPosition.X] != tileType) {
				map.tiles[newPosition.Y][newPosition.X] = tileType;
			}
			
			// Trim the map
			tileOffset = vec2.add(tileOffset, trim(map));
			newPosition = vec2.sub(newPosition, tileOffset);
			
			// Shift actors, entities and the player starting position
			pixelOffset = vec2.mul(tileOffset, -Z.settings.tileSize)
			shiftObjects(map, pixelOffset);
			
			// If the origin was changed (ie. if the map was resized), reposition the camera
			Z.camera.position = vec2.add(Z.camera.position, pixelOffset);
			
			// Rebuild map chunks and the collision overlay
			map.chunks = map.generateMapChunks();
			Z.collisionOverlay.initialise(map);
			map.dirty = true;	// Set map to dirty so it's data will be written to the world when
								// the editor map is changed
			// Notify the editor that changes have been made to map data
			Z.toolbar.setDirty(true);
		};
		
		// Resize the specified map's tile array to accomodate the specified position, filling any
		// new areas with empty tiles, and update all actor and entity positions accordingly
		//	map:		The map to resize
		//	position:	A tile position outside of the current map bounds
		//	returns:	An offset from the current origin representing the new origin (in tiles)
		var resize = function(map, position) {
			var topLeft = vec2(Math.min(position.X, 0), Math.min(position.Y, 0)),
				bottomRight = vec2(
					Math.max(map.size.X - 1, position.X),
					Math.max(map.size.Y - 1, position.Y)
				),
				size = vec2.add(vec2.sub(bottomRight, topLeft), vec2(1, 1)),
				tiles = [],
				row = null;
			
			// Make sure the map is at least 1 tile in size
			size.X = Math.max(size.X, 1);
			size.Y = Math.max(size.Y, 1);
			bottomRight.X = Math.max(bottomRight.X, topLeft.X + 1);
			bottomRight.Y = Math.max(bottomRight.Y, topLeft.Y + 1);
			
			// Rebuild the tiles and shift existing tiles if the origin has changed
			for (var y = topLeft.Y; y <= bottomRight.Y; y++) {
				row = [];
				for (var x = topLeft.X; x <= bottomRight.X; x++) {
					// If this position is outside the map bounds, set the tile to empty
					if (x < 0 || x >= map.size.X || y < 0 || y >= map.size.Y) {
						row.push("0");
					} else {	// Otherwise copy an existing tile into the new position
						row.push(map.tiles[y][x]);
					}
				}
				tiles.push(row);
			}
			map.size = size;
			map.tiles = tiles;
			map.dirty = true;
			return topLeft;
		};
		
		// Trim map dimensions so that there is no empty space around each edge
		var trim = function(map) {
			var minX = Infinity,
				maxX = -Infinity,
				minY = Infinity,
				maxY = -Infinity,
				size = null;
			
			// Find the minimum and maximum populated tiles in each dimension
			for (var y = 0; y < map.size.Y; y++) {
				for (var x = 0; x < map.size.X; x++) {
					if (map.tiles[y][x] != "0") {
						if (x < minX) { minX = x; }
						if (x > maxX) { maxX = x; }
						if (y < minY) { minY = y; }
						if (y > maxY) { maxY = y; }
					}
				}
			}
			size = vec2((maxX - minX) + 1, (maxY - minY) + 1);
			
			// Make sure the map is at least 1 tile in size
			size.X = Math.max(size.X, 1);
			size.Y = Math.max(size.Y, 1);
			
			// If there is empty space on any side, rebuild the tiles
			if (size.X < map.size.X || size.Y < map.size.Y) {
				var tiles = [],
					row = null;
				for (var y = minY; y <= maxY; y++) {
					row = [];
					for (var x = minX; x <= maxX; x++) {
						row.push(map.tiles[y][x]);
					}
					tiles.push(row);
				}
				map.size = size;
				map.tiles = tiles;
				map.dirty = true;
				return vec2(minX, minY);
			}
			return vec2();
		};
		
		// Shift actors, entities, lights and the player starting position by the specified offset
		var shiftObjects = function(map, offset) {
			// Actors
			for (var i = map.actors.length; i--;) {
				map.actors[i].position = vec2.add(map.actors[i].position, offset);
				
				// If this actor is a platform, offset each waypoint position
				if (map.actors[i].baseType == "platform") {
					for (var j = map.actors[i].wayPoints.length; j--;) {
						map.actors[i].wayPoints[j].target = vec2.add(
							map.actors[i].wayPoints[j].target,
							offset
						);
					}
				}
			}
			
			// Entities
			for (var i = map.entities.length; i--;) {
				map.entities[i].position = vec2.add(map.entities[i].position, offset);
			}
			
			// Lights
			for (var i = map.lights.length; i--;) {
				if (map.lights[i].position) {
					map.lights[i].position = vec2.add(map.lights[i].position, offset);
				}
			}
			
			// Player starting position
			map.playerStartingPosition = vec2.add(map.playerStartingPosition, offset);
			map.dirty = true;
		};
		
		// Create an empty map and add it to world data, then load it in the editor
		Z.map.add = function() {
			// Keep a reference to the created map's data in this closure's context so it can be
			// restored if the add action is un-done and then re-done
			var mapId = "map_",
				map = Z.map.empty(),
				n = 0;
			
			// Generate a unique id for the map (sequential)
			while (Z.world.maps[mapId + ++n]) {}
			mapId += n;
			
			// Add the new map
			Z.actionList.performAction(
				"add map",
				function() {
					// Create the new map in the world and load it in the editor (if there isn't
					// already a map loaded)
					Z.world.maps[mapId] = map;
					if (!Z.editor.map) {
						Z.editor.changeMap(mapId, true);
					}
					
					// Update the map select menu
					Z.menuSelector.initialise.currentMap();
				},
				function() {
					// Remove map from world data
					delete Z.world.maps[mapId];
					
					// If this map is currently loaded in the editor, remove the current map
					if (Z.editor.map.id == mapId) {
						Z.editor.map = null;
						Z.editor.draw();
					}
					
					// If this map is the world's starting map, remove it
					if (Z.world.startingMap == mapId) {
						Z.world.startingMap = "";
					}
					
					// Update the map select menu
					Z.menuSelector.initialise.currentMap();
				}
			);
		};
		
		// Check entities in map a for any references to map b, remove any references and return a
		// list of entities that reference the map
		// Note: a and b are ids instead of to map instances, this is so that maps can be modified
		// directly in world data without having to instantiate them
		var checkEntityReferences = function(a, b) {
			var references = [];
			for (var i = Z.world.maps[a].entities.length; i--;) {
				if (Z.world.maps[a].entities[i].mapId && Z.world.maps[a].entities[i].mapId == b) {
					Z.world.maps[a].entities[i].mapId = "";
					references.push(Z.world.maps[a].entities[i]);
				}
			}
			return references;
		};
		
		// Remove the currently loaded map from world data
		Z.map.remove = function() {
			// Keep a reference to the current map's data in this closure's context so it can be
			// restored if the delete action is undone
			var mapId = Z.editor.map.id,
				map = Z.world.maps[mapId],
				startingMap = false,
				entityReferences = [];
			
			// Prompt before removing the map
			Z.prompt.show(
				"Are you sure you want to delete this map?",
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							Z.actionList.performAction(
								"delete map " + map.name,
								function() {
									// Remove map from world data
									delete Z.world.maps[mapId];
									
									// Remove the current loaded map
									Z.editor.map = null;
									Z.editor.draw();
									
									// If this map is the world's starting map, remove it
									if (Z.world.startingMap == mapId) {
										startingMap = true;
										Z.world.startingMap = "";
									}
									
									// Update the map select menu
									Z.menuSelector.initialise.currentMap();
									
									// Remove references to this map from all mapTransition
									// entities and keep track of references so they can be restored
									// if this action is undone
									for (var i in Z.world.maps) {
										if (!Z.world.maps.hasOwnProperty(i)) { continue; }
										
										// Don't remove references from entities in the map being
										// removed (they will be restored alongside the map if this
										// action is undone)
										if (i == mapId) { continue; }
										entityReferences = entityReferences.concat(
											checkEntityReferences(i, mapId)
										);
									}
								},
								function() {
									// Re-add map to world data
									Z.world.maps[mapId] = map;
									
									// If there is no map loaded in the editor, load this map
									if (!Z.editor.map) {
										Z.editor.changeMap(mapId, true);
									}
									
									// If this map was the world's starting map (and another map
									// hasn't been specified already), reset the starting map
									if (startingMap && !Z.world.startingMap) {
										Z.world.startingMap = mapId;
									}
									
									// Update the map select menu
									Z.menuSelector.initialise.currentMap();
									
									// If there were any references to this map in mapTransition
									// entities, replace the references
									for (var i = entityReferences.length; i--;) {
										entityReferences[i].mapId = mapId;
									}
								}
							);
						}
					},
					{
						text: "No",
						cssClass: "cancelbutton",
						callback: null
					}
				]
			);
		};
		
		// Return the tile type at the specified tile position (or 0 if outside the map bounds)
		Z.map.sampleTileType = function(position) {
			if (
				position.X >= 0 && position.X < this.size.X &&
				position.Y >= 0 && position.Y < this.size.Y
			) {
				return this.tiles[position.Y][position.X];
			}
			return 0;
		};
		
		// Handle mouse input for updating map tiles using the tile tool
		Z.map.handleInput = function(down, clicked) {
			var mapId = this.id;
			
			// When the user presses the mouse button, get a snapshot of the current map
			if (clicked) {
				_drawingTiles = true;
				_mapSnapshots.push(getSnapshot(this));
			
			// When the user releases the mouse button, get a snapshot of the updated map
			// and add an action to the action list
			} else if (!down && _drawingTiles) {
				_drawingTiles = false;
				var before = _mapSnapshots.pop(),
					after = getSnapshot(this);
				Z.actionList.performAction(
					"change tile",
					function() {
						// Action can only be performed if there is a map and it is the
						// same map on which the action was originally performed
						if (!Z.editor.map || Z.editor.map.id != mapId) { return; }
						setSnapshot(Z.editor.map, after);
						Z.editor.draw();
					},
					function() {
						// Action can only be undone if there is a map and it is the same
						// map on which the action was originally performed
						if (!Z.editor.map || Z.editor.map.id != mapId) { return; }
						setSnapshot(Z.editor.map, before);
						Z.editor.draw();
					},
					true
				);
			}
			
			// If the mouse button is down, update the map's tiles
			if (down) {
				var tilePosition = Z.input.mouseWorldTilePosition,
					outside = (
						tilePosition.X < 0 ||
						tilePosition.X >= this.size.X ||
						tilePosition.Y < 0 ||
						tilePosition.Y >= this.size.Y
					),
					tileType = outside ?
						"" :
						this.tiles[tilePosition.Y][tilePosition.X];
				
				// Only draw a tile if the user clicked outside the map bounds or the
				// clicked tile is a different tile type to the selected tile type
				if (outside || Z.editor.selectedTileType != tileType) {
					setTile(this, tilePosition, Z.editor.selectedTileType);
				}
			}
		};
		
		// Return this map's data for storage in a world
		Z.map.getData = function() {
			var data = {
				id: this.id,
				name: this.name,
				size: [this.size.X, this.size.Y],
				playerStartingPosition: [
					this.playerStartingPosition.X,
					this.playerStartingPosition.Y
				],
				persistent: this.persistent,
				tiles: encode(joinRows(this.tiles)),
				background: this.background.getData(),
				actors: [],
				entities: [],
				lights: []
			};
			
			// Add actor's data
			for (var i = this.actors.length; i--;) {
				data.actors.push(this.actors[i].getData());
			}
			
			// Add entities data
			for (var i = this.entities.length; i--;) {
				if (
					this.entities[i].type != "playerstart" &&	// Don't add player start marker
					this.entities[i].type != "platformwaypoint"	// Don't add platform waypoints
				) {
					data.entities.push(this.entities[i].getData());
				}
			}
			
			// Add lights data
			for (var i = this.lights.length; i--;) {
				data.lights.push(this.lights[i].getData());
			}
			return data;
		};
	});
}());