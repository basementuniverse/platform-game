Z.menuSelector = (function() {
	"use strict";
	
	// Create and return a menu item
	//	value:		The item's label
	//	selected:	True if this is the currently selected item
	//	click:		A function to call when the item is clicked
	var createItem = function(value, selected, click) {
		return $("<li class='menuitem'>")
			.toggleClass("selected", selected)
			.append(
				$("<a href='javascript:void(0)'>")
				.text(value)
				.click(click)
			);
	};
	
	// Initialise a texture atlas selector in one of the add/edit tile type dialogs
	//	id:			The element id of the texture atlas select control
	//	callbackId:	The callback id for the associated texture atlas selector
	var initialiseTileTypeTextureAtlas = function(id, callbackId) {
		var currentValueElement = $("#" + id + " .currentvalue"),
			menuElement = $("#" + id + " ul.menuitems");
		
		// Remove current items
		menuElement.find("li.menuitem, li.noitems").remove();
		
		// Populate menu with current texture atlases in world
		var item = null,
			imageCount = 0;
		for (var i in Z.world.textureAtlases) {
			if (!Z.world.textureAtlases.hasOwnProperty(i)) { continue; }
			imageCount++;
			menuElement.append(createItem(
				i,
				Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas == i,
				(function(textureAtlasId) {
					return function() {
						Z.menuSelector.select[callbackId](textureAtlasId);
						
						// Re-initialise the menu
						Z.menuSelector.initialise[callbackId]();
					};
				}(i))
			));
		}
		
		// If there are no images, add a 'no images' item to the list
		if (!imageCount) {
			menuElement.append(
				$("<li class='noitems'>").append($("<a>").text("No images"))
			);
		}
		
		// Set the current selected item element
		currentValueElement.text(
			Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas || "Select an image"
		);
	};
	
	// Select a texture atlas in one of the add/edit tile type dialogs and update the currently
	// selected tile type
	//	value:					The selected texture atlas
	//	textureOffsetSelector:	The callback id of the associated texture offset selector
	var selectTileTypeTextureAtlas = function(value, textureOffsetSelector) {
		// Change the current tile type's texture atlas in world data and if there is a
		// currently selected map, rebuild the map instance and redraw the editor canvas
		Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas = value;
		Z.editor.changeMap(null, false);
		
		// Re-initialise the associated texture offset selector
		Z.textureSelector.initialise[textureOffsetSelector]();
		
		// Notify the editor that changes have been made
		Z.toolbar.setDirty(true);
	};
	
	// A collection of initialise and select callbacks for each menu selector
	return {
		initialise: {
			currentMap: function() {
				var currentValueElement = $("#mapselect .currentvalue"),
					menuElement = $("#mapselect ul.menuitems");
				
				// Remove current items
				menuElement.find("li.menuitem, li.noitems")
				.tooltip("destroy")
				.remove();
				
				// Populate menu with current maps in world
				var item = null,
					mapCount = 0;
				for (var i in Z.world.maps) {
					if (!Z.world.maps.hasOwnProperty(i)) { continue; }
					item = createItem(
						Z.world.maps[i].name,
						(Z.editor.map && Z.editor.map.id == i),
						(function(mapId) {
							return function() {
								Z.menuSelector.select.currentMap(mapId);
								
								// Re-initialise the menu
								Z.menuSelector.initialise.currentMap();
							};
						}(i))
					);
					item
					.attr("data-tooltip", i)
					.tooltip({
						anchorX: -1,
						anchorY: 0,
						originX: 1,
						offsetX: -10,
						className: "tooltip-arrow tooltip-arrow-right"
					});
						
					mapCount++;
					menuElement.find("li.separator").before(item);
				}
				
				// If there are no maps, add a 'no maps' item to the list
				if (!mapCount) {
					menuElement.find("li.separator").before(
						$("<li class='noitems'>").append($("<a>").text("No maps"))
					);
				}
				
				// Disable map delete button if there are no maps or if there is no selected map
				$(".button.deletemapbutton").toggleClass("disabled", !mapCount || !Z.editor.map);
				
				// Set the current selected item element
				currentValueElement.text(Z.editor.map ? Z.editor.map.name : "Select a map");
			},
			startingMap: function() {
				var currentValueElement = $("#startingmapselect .currentvalue"),
					menuElement = $("#startingmapselect ul.menuitems");
				
				// Remove current items
				menuElement.find("li.menuitem, li.noitems").remove();
				
				// Populate menu with current maps in world
				var item = null,
					mapCount = 0;
				for (var i in Z.world.maps) {
					if (!Z.world.maps.hasOwnProperty(i)) { continue; }
					mapCount++;
					menuElement.append(createItem(
						Z.world.maps[i].name,
						Z.world.startingMap == i,
						(function(mapId) {
							return function() {
								Z.menuSelector.select.startingMap(mapId);
								
								// Re-initialise the menu
								Z.menuSelector.initialise.startingMap();
							};
						}(i))
					));
				}
				
				// If there are no maps, add a 'no maps' item to the list
				if (!mapCount) {
					menuElement.append(
						$("<li class='noitems'>").append($("<a>").text("No maps"))
					);
				}
				
				// Set the current selected item element
				currentValueElement.text(
					Z.world.startingMap ?
						Z.world.maps[Z.world.startingMap].name :
						"Select a map"
				);
			},
			backgroundImage: function() {
				var currentValueElement = $("#backgroundimageselect .currentvalue"),
					menuElement = $("#backgroundimageselect ul.menuitems");
				
				// Remove current items
				menuElement.find("li.menuitem, li.noitems").remove();
				
				// If there is no currently loaded map, don't populate the menu
				if (!Z.editor.map) { return; }
				
				// Populate menu with current background images in world
				var item = null,
					imageCount = 0;
				for (var i in Z.world.backgroundImages) {
					if (!Z.world.backgroundImages.hasOwnProperty(i)) { continue; }
					imageCount++;
					menuElement.append(createItem(
						i,
						Z.editor.map.background.imageId == i,
						(function(backgroundId) {
							return function() {
								Z.menuSelector.select.backgroundImage(backgroundId);
								
								// Re-initialise the menu
								Z.menuSelector.initialise.backgroundImage();
							};
						}(i))
					));
				}
				
				// If there are no images, add a 'no images' item to the list
				if (!imageCount) {
					menuElement.append(
						$("<li class='noitems'>").append($("<a>").text("No images"))
					);
				}
				
				// Set the current selected item element
				currentValueElement.text(Z.editor.map.background.imageId || "Select an image");
			},
			addTileTypeTextureAtlas: function() {
				initialiseTileTypeTextureAtlas(
					"addtiletypetextureatlasselect",
					"addTileTypeTextureAtlas"
				);
			},
			editTileTypeTextureAtlas: function() {
				initialiseTileTypeTextureAtlas(
					"edittiletypetextureatlasselect",
					"editTileTypeTextureAtlas"
				);
			}
		},
		select: {
			currentMap: function(value) {
				// Only load this map if it isn't currently loaded or if there isn't
				// a currently loaded map
				if (!Z.editor.map || value != Z.editor.map.id) {
					Z.editor.changeMap(value, true);
				}
			},
			startingMap: function(value) {
				// Change the world's starting map id
				Z.world.startingMap = value;
				
				// Notify the editor that changes have been made
				Z.toolbar.setDirty(true);
			},
			backgroundImage: function(value) {
				// If there is no currently loaded map, don't try to update the background image
				if (!Z.editor.map) { return; }
				
				// Change the current map's background image in world data, rebuild the currently
				// loaded map's background instance and re-draw the editor canvas
				Z.world.maps[Z.editor.map.id].background.backgroundImageId = value;
				Z.editor.map.background = Z.background.create(
					Z.world.maps[Z.editor.map.id].background
				);
				Z.editor.draw();
				
				// Notify the editor that changes have been made
				Z.toolbar.setDirty(true);
			},
			addTileTypeTextureAtlas: function(value) {
				selectTileTypeTextureAtlas(value, "addTileTypeTextureOffset");
			},
			editTileTypeTextureAtlas: function(value) {
				selectTileTypeTextureAtlas(value, "editTileTypeTextureOffset");
			}
		}
	};
}());