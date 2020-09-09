Z.addTileTypeDialog = (function() {
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
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button updates and closes the dialog
		$(".dialog.addtiletype .closebutton").click(function() {
			Z.dialogs.toggle("addtiletype", false);
		});
		
		// Reset button re-initialises the dialog
		$(".dialog.addtiletype .resetbutton").click(function() {
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
			Z.addTileTypeDialog.initialise();
		});
		
		// Delete button deletes the currently selected tile type
		$(".dialog.addtiletype .deletebutton").click(function() {
			// Delete tile type
			delete Z.world.tileTypes[Z.editor.selectedTileType];
			
			// Unselect the tile type
			Z.editor.selectedTileType = "0";
			
			// Update tile types toolpanel
			Z.tileToolPanel.update();
			
			// Close the tile type dialog without updating
			$("div.editor").removeClass(Z.addTileTypeDialog.cssClass);
			
			// Re-enable toolbar buttons
			$(".dialogdisable").removeClass("dialogdisabled");
		});
	});
	
	// Add an error message to the dialog
	var addError = function(message) {
		$("<div class='error'>").text(message).appendTo(".dialog.addtiletype .errors");
	};
	
	var _addTileTypeDialog = {
		cssClass: "showaddtiletype",	// The CSS classname to add to the document body in order
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
			$("#addtiletypename").val(tileType.name);
			
			// Initialise texture atlas select menu
			Z.menuSelector.initialise.addTileTypeTextureAtlas();
			
			// Initialise texture offset selector
			Z.textureSelector.initialise.addTileTypeTextureOffset();
			
			// Initialise tile type collision toggle buttons
			$("#addtiletypesolid").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeSolid()
			);
			$("#addtiletypetopedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeTopEdge()
			);
			$("#addtiletypebottomedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeBottomEdge()
			);
			$("#addtiletyperightedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeRightEdge()
			);
			$("#addtiletypeleftedge").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeLeftEdge()
			);
			$("#addtiletypeliquid").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeLiquid()
			);
			$("#addtiletypeladder").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeLadder()
			);
			
			// Initialise draw front toggle button
			$("#addtiletypedrawfront").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeDrawFront()
			);
			
			// Initialise cast shadow toggle button
			$("#addtiletypecastshadow").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeCastShadow()
			);
			
			// Initialise friction slider control
			Z.sliderControl.initialise.addTileTypeFriction();
			
			// Initialise conveyor slider control
			Z.sliderControl.initialise.addTileTypeConveyor();
			
			// Initialise breathable toggle button
			$("#addtiletypebreathable").toggleClass(
				"checked",
				Z.toggleButton.initialise.addTileTypeBreathable()
			);
		},
		
		// Update the selected tile type in the current world to match the dialog controls
		//	callback:	A function to call when finished updating the tile type, this function
		//				should close the dialog (this function won't be called if any errors occur)
		update: function(callback) {
			var tileTypeName = $("#addtiletypename").val(),
				success = true
			
			// Remove all current error messages
			$(".dialog.addtiletype .error").remove();
			
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
	Z.dialogs.registerDialog("addtiletype", _addTileTypeDialog);
	
	return _addTileTypeDialog;
}());