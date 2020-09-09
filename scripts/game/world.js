Z.world = (function() {
	"use strict";
	
	// Return a default empty tile type definition
	var getEmptyTileType = function() {
		return {
			id: 0,
			name: "New Tile Type",
			textureAtlas: "",
			textureOffset: vec2(),
			drawFront: false,
			castShadow: false,
			friction: 1,
			conveyor: 0,
			breathable: false,
			ladder: false,
			liquid: false,
			solid: false,
			topEdge: false,
			bottomEdge: false,
			leftEdge: false,
			rightEdge: false
		};
	};
	
	var _world = {
		name: "",
		textureAtlases: [],			// List of texture atlas images, indexed by id
		textureAtlasPaths: [],		// List of texture atlas paths, indexed by id (used by editor)
		backgroundImages: [],		// List of background images, indexed by id
		backgroundImagePaths: [],	// List of background paths, indexed by id (used by editor)
		startingMap: "",			// The name of the map to start playing on
		maps: [],					// List of map data objects, indexed by id
		tileTypes: [				// List of tile type definitions
			getEmptyTileType()
		],
		initialise: function() {
			var worldData = Z.content.items["world"],
				textureAtlas = null,
				backgroundImage = null,
				map = null;
			this.name = worldData.name;
			
			// Load textures atlases into array by id
			for (var i = worldData.textureAtlases.length; i--;) {
				textureAtlas = worldData.textureAtlases[i];
				this.textureAtlases[textureAtlas.id] = textureAtlas.image;
				
				// If currently in the editor, save the image path
				if (Z.editor) {
					this.textureAtlasPaths[textureAtlas.id] = textureAtlas.path;
				}
			}
			
			// Load background images into array by id
			for (var i = worldData.backgroundImages.length; i--;) {
				backgroundImage = worldData.backgroundImages[i];
				this.backgroundImages[backgroundImage.id] = backgroundImage.image;
				
				// If currently in the editor, save the image path
				if (Z.editor) {
					this.backgroundImagePaths[backgroundImage.id] = backgroundImage.path;
				}
			}
			
			// Load maps data into array by id (maps will still need to be instantiated)
			for (var i = worldData.maps.length; i--;) {
				map = worldData.maps[i];
				this.maps[map.id] = map.data;
			}
			
			// Make sure a starting map has been defined and exists in the world
			this.startingMap = worldData.startingMap;
			if (!this.startingMap) {
				console.warn("No starting map defined.");
			} else if (!this.maps[this.startingMap]) {
				console.warn("Starting map (%s) doesn't exist.", this.startingMap);
				this.startingMap = "";
			}
			
			// Initialise tile type definitions
			var tileType = null;
			this.tileTypes = [];
			for (var i = worldData.tileTypes.length; i--;) {
				tileType = worldData.tileTypes[i];
				this.tileTypes[tileType.id] = tileType;
				if (tileType.textureAtlas) {
					tileType.textureOffset = vec2(tileType.textureOffset);
				}
			}
		},
		dispose: function() {
			// Clear texture atlases
			this.textureAtlases = [];
			
			// Clear background images
			this.backgroundImages = [];
			
			// Clear map data
			this.maps = [];
		},
		load: function(callback, path, data) {
			Z.utilities.loadData(function(worldData) {
				var items = 0,
					checkFinished = function() {
						if (!items) {
							callback(worldData);
						}
					};
				
				// Count items to load
				items += worldData.textureAtlases.length;
				items += worldData.backgroundImages.length;
				items += worldData.maps.length;
				
				// If there are no items to load, callback immediately
				checkFinished();
				
				// Load texture atlases and tiletypes
				for (var i = 0, length = worldData.textureAtlases.length; i < length; i++) {
					(function(index) {
						Z.utilities.loadImage(function(image) {
							worldData.textureAtlases[index].image = image;
							items--;
							checkFinished();
						}, worldData.textureAtlases[index].path);
					}(i));
				}
				
				// Load background images
				for (var i = 0, length = worldData.backgroundImages.length; i < length; i++) {
					(function(index) {
						Z.utilities.loadImage(function(image) {
							worldData.backgroundImages[index].image = image;
							items--;
							checkFinished();
						}, worldData.backgroundImages[index].path);
					}(i));
				}
				
				// Load maps
				for (var i = 0, length = worldData.maps.length; i < length; i++) {
					(function(index) {
						Z.map.load(function(mapData) {
							worldData.maps[index].data = mapData;
							items--;
							checkFinished();
						}, worldData.maps[index].path, worldData.maps[index].data);
					}(i));
				}
			}, path, data);
		},
		getTileTypeData: function(tileType) {
			return {
				id: tileType.id,
				name: tileType.name,
				textureAtlas: tileType.textureAtlas,
				textureOffset: tileType.textureOffset ?
					[tileType.textureOffset.X, tileType.textureOffset.Y] :
					null,
				drawFront: tileType.drawFront,
				castShadow: tileType.castShadow,
				friction: tileType.friction,
				conveyor: tileType.conveyor,
				breathable: tileType.breathable,
				ladder: tileType.ladder,
				liquid: tileType.liquid,
				solid: tileType.solid,
				topEdge: tileType.topEdge,
				bottomEdge: tileType.bottomEdge,
				leftEdge: tileType.leftEdge,
				rightEdge: tileType.rightEdge
			};
		},
		getData: function() {
			var data = {
				name: this.name,
				textureAtlases: [],
				backgroundImages: [],
				startingMap: this.startingMap,
				maps: [],
				tileTypes: []
			};
			
			// Populate texture atlases
			for (var i in this.textureAtlasPaths) {
				if (!this.textureAtlasPaths.hasOwnProperty(i)) { continue; }
				data.textureAtlases.push({
					id: i,
					path: this.textureAtlasPaths[i]
				});
			}
			
			// Populate background images
			for (var i in this.backgroundImagePaths) {
				if (!this.backgroundImagePaths.hasOwnProperty(i)) { continue; }
				data.backgroundImages.push({
					id: i,
					path: this.backgroundImagePaths[i]
				});
			}
			
			// Populate maps (including data from the currently loaded map if there is one)
			if (Z.editor.map) {
				this.maps[Z.editor.map.id] = Z.editor.map.getData();
			}
			for (var i in this.maps) {
				if (!this.maps.hasOwnProperty(i)) { continue; }
				data.maps.push({
					id: i,
					path: "",
					data: this.maps[i]
				});
			}
			
			// Populate tile types
			for (var i in this.tileTypes) {
				if (!this.tileTypes.hasOwnProperty(i)) { continue; }
				data.tileTypes.push(this.getTileTypeData(this.tileTypes[i]));
			}
			return data;
		},
		
		// Return an empty tile type definition
		getEmptyTileType: getEmptyTileType
	};
	
	// Register loader function
	Z.content.registerLoader("world", _world.load);
	
	return _world;
}());