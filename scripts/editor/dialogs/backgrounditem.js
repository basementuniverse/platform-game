Z.backgroundItem = (function() {
	"use strict";
	
	return {
		// Add a background image to world data
		//	id:		The new background's id
		//	path:	The new background's path
		//	image:	The new background's image instance
		add: function(id, path, image) {
			Z.world.backgroundImages[id] = image;
			Z.world.backgroundImagePaths[id] = path;
		},
		
		// Update an existing background's id in world data and any maps that are using the
		// background (including the currently loaded map instance if it uses this background)
		//	originalId:	The original id of the background to update
		//	id:			The new id of the background
		updateId: function(originalId, id) {
			// Update background in world
			Z.world.backgroundImages[id] = Z.world.backgroundImages[originalId];
			Z.world.backgroundImagePaths[id] = Z.world.backgroundImagePaths[originalId];
			delete Z.world.backgroundImages[originalId];
			delete Z.world.backgroundImagePaths[originalId];
			
			// Update background in all maps that are using it
			for (var i in Z.world.maps) {
				if (!Z.world.maps.hasOwnProperty(i)) { continue; }
				if (Z.world.maps[i].background.backgroundImageId == originalId) {
					Z.world.maps[i].background.backgroundImageId = id;
				}
			}
			
			// Update background in current map if it is using this background
			if (Z.editor.map.background.imageId == originalId) {
				Z.editor.map.background.imageId = id;
				Z.editor.draw();
			}
		},
		
		// Update an existing background's path and image instance in world data and the current
		// map if it uses this background
		//	id:		The id of the background to update
		//	path:	The new background image path
		//	image:	The new background image instance
		updatePath: function(id, path, image) {
			Z.world.backgroundImages[id] = image;
			Z.world.backgroundImagePaths[id] = path;
			
			// If current loaded map is using this background, rebuild the background instance
			if (Z.editor.map.background.imageId == id) {
				Z.editor.map.background = Z.background.create(
					Z.world.maps[Z.editor.map.id].background
				);
				Z.editor.draw();
			}
		},
		
		// Remove the specified background from world data, any maps that are using it and the
		// current map if it uses this background
		//	id:		The id of the background to remove
		//	maps:	A list of maps that are using this background
		remove: function(id, maps) {
			// Remove background from the world if it exists
			if (Z.world.backgroundImages[id]) {
				delete Z.world.backgroundImages[id];
				delete Z.world.backgroundImagePaths[id];
			}
			
			// Remove this background image from any maps that are using it
			for (var i = 0, length = maps.length; i < length; i++) {
				maps[i].background.backgroundImageId = "";
			}
			
			// Check if the map currently loaded in the editor is using this image
			// and remove the image from it's background instance if it is, then
			// redraw the editor canvas
			if (Z.editor.map.background.imageId == id) {
				Z.editor.map.background.image = null;
				Z.editor.map.background.imageId = "";
				Z.editor.draw();
			}
		}
	};
}());