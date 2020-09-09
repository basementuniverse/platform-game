Z.textureAtlasItem = (function() {
	"use strict";
	
	return {
		// Add a texture atlas to world data
		//	id:		The new texture atlas id
		//	path:	The new texture atlas path
		//	image:	The new texture atlas image instance
		add: function(id, path, image) {
			Z.world.textureAtlases[id] = image;
			Z.world.textureAtlasPaths[id] = path;
		},
		
		// Update an existing texture atlases id in world data and any tile types that are using
		// the texture atlas, and rebuild the currently loaded map
		//	originalId:	The original id of the texture atlas to update
		//	id:			The new id of the texture atlas
		updateId: function(originalId, id) {
			// Update texture atlas in world
			Z.world.textureAtlases[id] = Z.world.textureAtlases[originalId];
			Z.world.textureAtlasPaths[id] = Z.world.textureAtlasPaths[originalId];
			delete Z.world.textureAtlases[originalId];
			delete Z.world.textureAtlasPaths[originalId];
			
			// Update texture atlas in all tile types that are using it
			for (var i in Z.world.tileTypes) {
				if (!Z.world.tileTypes.hasOwnProperty(i)) { continue; }
				if (Z.world.tileTypes[i].textureAtlas == originalId) {
					Z.world.tileTypes[i].textureAtlas = id;
				}
			}
		},
		
		// Update an existing texture atlases path and image instance in world data and rebuild
		// the current map
		//	id:		The id of the texture atlas to update
		//	path:	The new texture atlas image path
		//	image:	The new texture atlas image instance
		updatePath: function(id, path, image) {
			Z.world.textureAtlases[id] = image;
			Z.world.textureAtlasPaths[id] = path;
			
			// Rebuild current map and redraw the editor canvas
			Z.editor.changeMap(null, false);
		},
		
		// Remove the specified texture atlas from world data and any tile types that are using it
		// and rebuild the currently loaded map
		//	id:		The id of the texture atlas to remove
		//	tiles:	A list of tile types that are using this texture atlas
		remove: function(id, tiles) {
			// Remove texture atlas from the world if it exists
			if (Z.world.textureAtlases[id]) {
				delete Z.world.textureAtlases[id];
				delete Z.world.textureAtlasPaths[id];
			}
			
			// Remove this texture atlas from any tile types that are using it
			for (var i = 0, length = tiles.length; i < length; i++) {
				tiles[i].textureAtlas = "";
			}
			
			// Rebuild current map and redraw the editor canvas
			Z.editor.changeMap(null, false);
		}
	};
}());