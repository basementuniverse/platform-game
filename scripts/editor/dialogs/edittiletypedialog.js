Z.editTileTypeDialog = (function() {
	"use strict";
	
	// Keep track of initial values so they can be reset if the dialog is reset
	var _textureAtlas = "",
		_textureOffset = vec2(),
		_solid = false,
		_topEdge = false,
		_bottomEdge = false,
		_rightEdge = false,
		_leftEdge = false,
		_liquid = false,
		_ladder = false,
		_drawFront = false,
		_castShadow = false,
		_friction = 0,
		_conveyor = 0,
		_breathable = false;
	
	// Replace all instances of tileType in the specified map data with 0
	//	map:		The map in which to replace tile types
	//	tileType:	The tile type to replace with 0
	var replaceTileTypes = function(map, tileType) {
		for (var i = 0, length = map.tiles.length; i < length; i++) {
			if (map.tiles[i] instanceof Array) {
				if (map.tiles[i][1] == tileType) {
					map.tiles[i][1] = 0;
				}
			} else if (map.tiles[i] == tileType) {
				map.tiles[i] = 0;
			}
		}
	};
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button updates and closes the dialog
		$(".dialog.edittiletype .closebutton").click(function() {
			Z.dialogs.toggle("edittiletype", false);
		});
		
		// Reset button re-initialises the dialog
		$(".dialog.edittiletype .resetbutton").click(function() {
			// Reset tile type texture atlas and offset
			Z.world.tileTypes[Z.editor.selectedTileType].textureAtlas = _textureAtlas;
			Z.world.tileTypes[Z.editor.selectedTileType].textureOffset = vec2(_textureOffset);
			
			// Reset tile type collision settings
			Z.world.tileTypes[Z.editor.selectedTileType].solid = _solid;
			Z.world.tileTypes[Z.editor.selectedTileType].topEdge = _topEdge;
			Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge = _bottomEdge;
			Z.world.tileTypes[Z.editor.selectedTileType].rightEdge = _rightEdge;
			Z.world.tileTypes[Z.editor.selectedTileType].leftEdge = _leftEdge;
			Z.world.tileTypes[Z.editor.selectedTileType].liquid = _liquid;
			Z.world.tileTypes[Z.editor.selectedTileType].ladder = _ladder;
			
			// Reset tile type draw front state
			Z.world.tileTypes[Z.editor.selectedTileType].drawFront = _drawFront;
			
			// Reset tile type cast shadow state
			Z.world.tileTypes[Z.editor.selectedTileType].castShadow = _castShadow;
			
			// Reset tile type friction
			Z.world.tileTypes[Z.editor.selectedTileType].friction = _friction;
			
			// Reset tile type conveyor amount
			Z.world.tileTypes[Z.editor.selectedTileType].conveyor = _conveyor;
			
			// Reset tile type breathable state
			Z.world.tileTypes[Z.editor.selectedTileType].breathable = _breathable;
			Z.editTileTypeDialog.initialise();
		});
		
		// Delete button deletes the currently selected tile type
		$(".dialog.edittiletype .deletebutton").click(function() {
			Z.prompt.show(
				"Are you sure you want to delete this tile type? This action cannot be undone.",
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							// Delete tile type
							delete Z.world.tileTypes[Z.editor.selectedTileType];
							
							// Check through each map and replace this tile type with empty tiles
							for (var i in Z.world.maps) {
								if (Z.world.maps.hasOwnProperty(i)) {
									replaceTileTypes(Z.world.maps[i], Z.editor.selectedTileType);
								}
							}
							
							// Unselect the tile type
							Z.editor.selectedTileType = "0";
							
							// Update tile types toolpanel
							Z.tileToolPanel.update();
							
							// If there is a currently selected map, rebuild it and redraw the
							// editor canvas
							Z.editor.changeMap(null, false);
							
							// Notify the editor that changes have been made to world data
							Z.toolbar.setDirty(true);
							
							// Close the tile type dialog without updating
							$("div.editor").removeClass(Z.editTileTypeDialog.cssClass);
							
							// Re-enable toolbar buttons
							$(".dialogdisable").removeClass("dialogdisabled");
						}
					},
					{
						text: "No",
						cssClass: "cancelbutton",
						callback: null
					}
				]
			);
		});
	});
	
	// Add an error message to the dialog
	var addError = function(message) {
		$("<div class='error'>").text(message).appendTo(".dialog.tiletype .errors");
	};
	
	var _editTileTypeDialog = {
		cssClass: "showedittiletype",	// The CSS classname to add to the document body in order
										// to display this dialog screen
		// Initialise the tile type controls
		initialise: function() {
			// Store initial values
			var tileType = Z.world.tileTypes[Z.editor.selectedTileType];
			_textureAtlas = tileType.textureAtlas;
			_textureOffset = tileType.textureOffset ? vec2(tileType.textureOffset) : null;
			_solid = tileType.solid;
			_topEdge = tileType.topEdge;
			_bottomEdge = tileType.bottomEdge;
			_rightEdge = tileType.rightEdge;
			_leftEdge = tileType.leftEdge;
			_liquid = tileType.liquid;
			_ladder = tileType.ladder;
			_drawFront = tileType.drawFront;
			_castShadow = tileType.castShadow;
			_friction = tileType.friction;
			_conveyor = tileType.conveyor;
			_breathable = tileType.breathable;
			
			// Set control/input values
			$("#edittiletypename").val(tileType.name);
			
			// Initialise texture atlas select menu
			Z.menuSelector.initialise.editTileTypeTextureAtlas();
			
			// Initialise texture offset selector
			Z.textureSelector.initialise.editTileTypeTextureOffset();
			
			// Initialise tile type collision toggle buttons
			$("#edittiletypesolid").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeSolid()
			);
			$("#edittiletypetopedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeTopEdge()
			);
			$("#edittiletypebottomedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeBottomEdge()
			);
			$("#edittiletyperightedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeRightEdge()
			);
			$("#edittiletypeleftedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeLeftEdge()
			);
			$("#edittiletypeliquid").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeLiquid()
			);
			$("#edittiletypeladder").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeLadder()
			);
			
			// Initialise draw front toggle button
			$("#edittiletypedrawfront").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeDrawFront()
			);
			
			// Initialise cast shadow toggle button
			$("#edittiletypecastshadow").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeCastShadow()
			);
			
			// Initialise friction slider control
			Z.sliderControl.initialise.editTileTypeFriction();
			
			// Initialise conveyor slider control
			Z.sliderControl.initialise.editTileTypeConveyor();
			
			// Initialise breathable toggle button
			$("#edittiletypebreathable").toggleClass(
				"checked",
				Z.toggleButton.initialise.editTileTypeBreathable()
			);
		},
		
		// Update the selected tile type in the current world to match the dialog controls
		//	callback:	A function to call when finished updating the tile type, this function
		//				should close the dialog (this function won't be called if any errors occur)
		update: function(callback) {
			var tileTypeName = $("#edittiletypename").val(),
				success = true
			
			// Remove all current error messages
			$(".dialog.edittiletype .error").remove();
			
			// Make sure the tile type has a name
			if (!tileTypeName) {
				addError("Tile type name must not be empty.");
				success = false;
			}
			
			// No errors occurred, update tile type in world data
			if (success) {
				// Check if the tile type's name was changed
				if (Z.world.tileTypes[Z.editor.selectedTileType].name != tileTypeName) {
					Z.world.tileTypes[Z.editor.selectedTileType].name = tileTypeName;
					
					// Notify the editor that changes have been made
					Z.toolbar.setDirty(true);
				}
				
				// Update the tile types toolpanel
				Z.tileToolPanel.update();
				callback();
			}
		}
	};
	
	// Register dialog
	Z.dialogs.registerDialog("edittiletype", _editTileTypeDialog);
	
	return _editTileTypeDialog;
}());