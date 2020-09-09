Z.tileToolPanel = (function() {
	"use strict";
	
	var TILETYPE_BUTTON_SIZE = 30;		// The size of tile type buttons
	
	// Add a new tile type and display the edit tile type dialog
	var addTileType = function() {
		// Generate a unique sequential id for the new tile type
		var n = 1,
			id = "";
		while (Z.world.tileTypes[++n + ""]) {}
		id = n + "";
		
		// Create a new empty tile type and select it
		Z.world.tileTypes[id] = Z.world.getEmptyTileType();
		Z.world.tileTypes[id].id = id;
		Z.editor.selectedTileType = id;
		Z.tileToolPanel.update();
		
		// Notify the editor that changes have been made
		Z.toolbar.setDirty(true);
		
		// Display the tile types dialog
		Z.dialogs.toggle("addtiletype", true);
	};
	
	// Create and return a tile type button element
	var createTileTypeButton = function(id, tileType) {
		var selected = id == Z.editor.selectedTileType,
			button = $("<a class='tiletypebutton' href='javascript:void(0)'>")
				.toggleClass("selected", selected)
				.click(function() {
					if (selected && id != "0") {
						Z.dialogs.toggle("edittiletype", true);
					} else {
						Z.editor.selectedTileType = id;
						Z.tileToolPanel.update();
					}
				})
				.attr("data-tooltip", tileType.name)
				.tooltip({
					anchorX: 0,
					anchorY: 1,
					originY: -1,
					offsetY: 10,
					className: "tooltip-arrow tooltip-arrow-up"
				});
		
		// If this tile type has a texture, add an image to the element
		if (
			tileType.textureAtlas &&
			Z.world.textureAtlases[tileType.textureAtlas] &&
			tileType.textureOffset
		) {
			var scale = TILETYPE_BUTTON_SIZE / Z.settings.tileSize,
				textureAtlas = Z.world.textureAtlases[tileType.textureAtlas],
				image = $("<img>")
				.attr("src", textureAtlas.src)
				.css({
					height: Math.floor(textureAtlas.height * scale),
					width: Math.floor(textureAtlas.width * scale),
					top: -tileType.textureOffset.Y * TILETYPE_BUTTON_SIZE,
					left: -tileType.textureOffset.X * TILETYPE_BUTTON_SIZE
				});
			button.append($("<div class='imagecontainer'>").append(image));
		}
		
		// Append selection indicator
		button.append($("<div class='selectindicator'>"));
		
		// Append edit indicator (unless this is the default empty tile type which can't be edited)
		if (selected && id != "0") {
			button.append($("<div class='editindicator'>"));
		}
		return button;
	};
	
	return {
		update: function() {
			// Clear current tile type buttons
			$(".toolpanelcontent.tiletypes .tiletypebuttons .tiletypebutton")
			.tooltip("destroy")
			.remove();
			
			// Create a button for each tile type in the world
			for (var i in Z.world.tileTypes) {
				if (!Z.world.tileTypes.hasOwnProperty(i)) { continue; }
				$(".toolpanelcontent.tiletypes .tiletypebuttons").append(createTileTypeButton(
					i,
					Z.world.tileTypes[i]
				));
			}
			
			// Create a button for adding a new tile type
			$(".toolpanelcontent.tiletypes .tiletypebuttons").append(
				$("<a class='tiletypebutton addtiletypebutton' href='javascript:void(0)'>")
				.click(addTileType)
				.attr("data-tooltip", "Add a new tile type")
				.tooltip({
					anchorX: -1,
					anchorY: 0,
					originX: 1,
					offsetX: -10,
					className: "tooltip-arrow tooltip-arrow-right"
				})
			);
		}
	};
}());