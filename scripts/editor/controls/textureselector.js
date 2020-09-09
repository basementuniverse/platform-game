Z.textureSelector = (function() {
	"use strict";
	
	var TEXTURE_PREVIEW_SIZE = 20,		// The size of the texture preview element
		TEXTURE_BUTTON_SIZE = 30;		// The size of texture buttons
	
	// Create and return a texture button element
	//	x:				The x offset for the current texture tile
	//	y:				The y offset for the current texture tile
	//	textureAtlas:	The texture atlas containing the textures
	//	textureOffset:	The current texture offset
	//	callback:		The callback id for the current texture selector control
	var createTextureButton = function(x, y, textureAtlas, textureOffset, callback) {
		var item = $("<a class='texture' href='javascript:void(0)'>")
			.toggleClass("selected", textureOffset.X == x && textureOffset.Y == y)
			.click(function() {	// Clicking a texture will select the offset value
				Z.textureSelector.update[callback](vec2(x, y));
				
				// Update the selector
				Z.textureSelector.initialise[callback]();
			});
		
		// Add an image to the element
		var scale = TEXTURE_BUTTON_SIZE / Z.settings.tileSize,
			image = $("<img>")
			.attr("src", textureAtlas.src)
			.css({
				height: textureAtlas.height * scale,
				width: textureAtlas.width * scale,
				top: -y * TEXTURE_BUTTON_SIZE,
				left: -x * TEXTURE_BUTTON_SIZE
			});
		item.append(image);
		
		// Append selection indicator
		item.append($("<div class='selector'>"));
		return item;
	};
	
	// Initialise a texture offset selector in one of the add/edit tile type dialogs
	//	id:			The element id of the texture offset selector
	//	callbackId:	The callback id to use when selecting a texture
	var initialiseTileTypeTextureOffset = function(id, callbackId) {
		// Clear current texture buttons
		$("#" + id + " .textureselector .texture").remove();
		
		// Don't initialise the selector if no texture atlas has been selected yet
		if (!Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas) { return; }
		
		// Get the texture atlas for the currently selected tile type and calculate the
		// tile dimensions for the image
		var textureAtlasId = Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas,
			textureAtlas = Z.world.textureAtlases[textureAtlasId],
			textureOffset = Z.world.tileTypes[Z.editor.selectedTileType].textureOffset,
			size = vec2.div(vec2(
					textureAtlas.width,
					textureAtlas.height
				), Z.settings.tileSize),
			image = null;
		
		// Loop through texture tiles in the texture atlas and add a button for each one
		for (var x = 0; x < size.X; x++) {
			for (var y = 0; y < size.Y; y++) {
				$("#" + id + " .textureselector").append(
					createTextureButton(
						x, y,
						textureAtlas,
						textureOffset,
						callbackId
					)
				);
			}
		}
		
		// Update the current value element
		var scale = TEXTURE_PREVIEW_SIZE / Z.settings.tileSize;
		$("#" + id + " .currentvalue .texturepreviewinner")
		.empty()
		.append(
			$("<img>")
			.attr("src", textureAtlas.src)
			.css({
				height: textureAtlas.height * scale,
				width: textureAtlas.width * scale,
				top: -textureOffset.Y * TEXTURE_PREVIEW_SIZE,
				left: -textureOffset.X * TEXTURE_PREVIEW_SIZE
			})
		);
		$("#" + id + " .currentvalue .currentvaluetext").text(
			vec2.toString(textureOffset, ", ")
		);
	};
	
	// Update the selected tile type's texture offset when an offset is selected in one of the
	// add/edit tile type dialogs
	//	offset:	The selected offset
	var updateTileTypeTextureOffset = function(offset) {
		// Change the current tile type's texture offset in world data and if there is a
		// currently selected map, rebuild the map instance and redraw the editor canvas
		Z.world.tileTypes[Z.editor.selectedTileType].textureOffset = offset;
		Z.editor.changeMap(null, false);
		
		// Notify the editor that changes have been made
		Z.toolbar.setDirty(true);
	};
	
	return {
		initialise: {
			addTileTypeTextureOffset: function() {
				initialiseTileTypeTextureOffset(
					"addtiletypetextureoffsetselect",
					"addTileTypeTextureOffset"
				);
			},
			editTileTypeTextureOffset: function() {
				initialiseTileTypeTextureOffset(
					"edittiletypetextureoffsetselect",
					"editTileTypeTextureOffset"
				);
			}
		},
		update: {
			addTileTypeTextureOffset: updateTileTypeTextureOffset,
			editTileTypeTextureOffset: updateTileTypeTextureOffset
		}
	};
}());