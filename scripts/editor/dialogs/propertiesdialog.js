Z.propertiesDialog = (function() {
	"use strict";
	
	// Keep track of initial values so they can be reset if the dialog is reset
	var _private = false,
		_startingMapId = "",
		_currentMapPersistent = false,
		_currentMapBackground = null;
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button updates and closes the dialog
		$(".dialog.worldproperties .closebutton").click(function() {
			Z.dialogs.toggle("worldproperties", false);
		});
		
		// Reset button re-initialises the dialog
		$(".dialog.worldproperties .resetbutton").click(function() {
			// Reset world private state
			Z.editor.worldData.private = _private;
			Z.toggleButton.initialise.worldPrivate();
			$("#worldprivate").toggleClass("checked", _private);
			
			// Reset world starting map
			Z.world.startingMap = _startingMapId;
			Z.menuSelector.initialise.startingMap();
			
			// Reset current map settings (if there is a map currently loaded)
			if (Z.editor.map) {
				// Persistent state
				Z.world.maps[Z.editor.map.id].persistent = _currentMapPersistent;
				Z.editor.map.persistent = _currentMapPersistent;
				Z.toggleButton.initialise.mapPersistent();
				$("#mappersistent").toggleClass("checked", _currentMapPersistent);
				
				// Background colour
				Z.world.maps[Z.editor.map.id].background.colour = _currentMapBackground.colour;
				
				// Background offset
				Z.world.maps[Z.editor.map.id].background.offset = _currentMapBackground.offset;
				
				// Background repeat
				Z.world.maps[Z.editor.map.id].background.repeatX = _currentMapBackground.repeatX;
				Z.world.maps[Z.editor.map.id].background.repeatY = _currentMapBackground.repeatY;
				
				// Background parallax
				Z.world.maps[Z.editor.map.id].background.parallax = _currentMapBackground.parallax;
				
				// Background image (reset this last since it will rebuild the background instance)
				Z.menuSelector.select.backgroundImage(_currentMapBackground.backgroundImageId);
			}
			Z.propertiesDialog.initialise();
		});
		
		// Initialise empty background (so current map's background settings can be saved and
		// retrieved when when the properties dialog is reset)
		_currentMapBackground = Z.background.empty();
	});
	
	// Add an error message to the dialog
	var addError = function(message) {
		$("<div class='error'>").text(message).appendTo(".dialog.worldproperties .errors");
	};
	
	var _propertiesDialog = {
		cssClass: "showproperties",		// The CSS classname to add to the document body in order
										// to display this dialog screen
		// Initialise the world properties fields
		initialise: function() {
			// Store initial values
			_private = Z.editor.worldData.private;
			_startingMapId = Z.world.startingMap;
			if (Z.editor.map) {
				_currentMapPersistent = Z.editor.map.persistent;
				
				// Initial background settings
				_currentMapBackground.colour = Z.editor.map.background.colour;
				_currentMapBackground.backgroundImageId = Z.editor.map.background.imageId;
				_currentMapBackground.offset = [
					Z.editor.map.background.offset.X,
					Z.editor.map.background.offset.Y
				];
				_currentMapBackground.repeatX = Z.editor.map.background.repeatX;
				_currentMapBackground.repeatY = Z.editor.map.background.repeatY;
				_currentMapBackground.parallax = [
					Z.editor.map.background.parallax.X,
					Z.editor.map.background.parallax.Y
				];
			}
			
			// World properties
			$("#worldname").val(Z.editor.worldData.name);
			$("#worlddescription").val(Z.editor.worldData.description);
			
			// Initialise starting map select menu
			Z.menuSelector.initialise.startingMap();
			
			// Map properties
			if (Z.editor.map) {
				$(".mapproperties").show();
				$("#mapname").val(Z.editor.map.name);
				$("#mappersistent").toggleClass(
					"checked",
					Z.toggleButton.initialise.mapPersistent()
				);
				
				// Initialise background colour selector
				Z.colourSelector.initialise.backgroundColour();
				
				// Initialise background image selector
				Z.menuSelector.initialise.backgroundImage();
				
				// Initialise background offset
				$("#backgroundoffsetx").val(Z.editor.map.background.offset.X);
				$("#backgroundoffsety").val(Z.editor.map.background.offset.Y);
				
				// Initial background repeat toggle buttons
				$("#backgroundrepeatx").toggleClass(
					"checked",
					Z.toggleButton.initialise.backgroundRepeatX()
				);
				$("#backgroundrepeaty").toggleClass(
					"checked",
					Z.toggleButton.initialise.backgroundRepeatY()
				);
				
				// Initialise background parallax slider controls
				Z.sliderControl.initialise.backgroundParallaxX();
				Z.sliderControl.initialise.backgroundParallaxY();
			} else {
				$(".mapproperties").hide();
			}
		},
		
		// Update the world meta data properties
		//	callback:	A function to call when finished validating input and updating properties,
		//				this function should close the dialog (this function won't be called if any
		//				errors occur)
		update: function(callback) {
			var worldName = $("#worldname").val(),
				worldDescription = $("#worlddescription").val(),
				mapName = $("#mapname").val(),
				mapBackgroundOffsetX = parseFloat($("#backgroundoffsetx").val()),
				mapBackgroundOffsetY = parseFloat($("#backgroundoffsety").val()),
				success = true;
			
			// Remove all current error messages
			$(".dialog.worldproperties .error").remove();
			
			// Make sure the world has a name
			if (!worldName) {
				addError("World name must not be empty.");
				success = false;
			}
			
			// If there is a map currently loaded, make sure it has a name
			if (Z.editor.map && !mapName) {
				addError("Map name must not be empty.");
				success = false;
			}
			
			// If there are any maps, make sure one of them is selected as the starting map
			var mapCount = 0;
			for (var i in Z.world.maps) {
				if (Z.world.maps.hasOwnProperty(i)) { mapCount++; }
			}
			if (mapCount > 0 && !Z.world.startingMap) {
				addError("A starting map must be selected.");
				success = false;
			}
			
			// No errors occurred, update world/map properties
			if (success) {
				// Check if any changes were made to world properties and update the world
				if (
					Z.editor.worldData.name != worldName ||
					Z.editor.worldData.description != worldDescription
				) {
					Z.world.name = worldName;
					Z.editor.worldData.name = worldName;
					Z.editor.worldData.description = worldDescription;
					
					// Notify the editor that changes have been made
					Z.toolbar.setDirty(true);
				}
				
				// If there is a map currently loaded, check if any changes were made to it's
				// properties and update the map
				if (Z.editor.map) {
					if (Z.editor.map.name != mapName) {
						Z.editor.map.name = mapName;
						Z.world.maps[Z.editor.map.id].name = mapName;
						
						// Update map select menus to display the new map name
						Z.menuSelector.initialise.currentMap();
						Z.menuSelector.initialise.startingMap();
						
						// Notify the editor that changes have been made
						Z.toolbar.setDirty(true);
					}
					
					// Check if the map's background offset was changed
					if (
						Z.editor.map.background.offset.X != mapBackgroundOffsetX ||
						Z.editor.map.background.offset.Y != mapBackgroundOffsetY
					) {
						Z.world.maps[Z.editor.map.id].background.offset = [
							mapBackgroundOffsetX,
							mapBackgroundOffsetY
						];
						
						// Rebuild the map's background instance and redraw the editor canvas
						Z.editor.map.background = Z.background.create(
							Z.world.maps[Z.editor.map.id].background
						);
						Z.editor.draw();
						
						// Notify the editor that changes have been made
						Z.toolbar.setDirty(true);
					}
				}
				
				// Callback to close the dialog
				callback();
			}
		}
	};
	
	// Register dialog
	Z.dialogs.registerDialog("worldproperties", _propertiesDialog);
	
	return _propertiesDialog;
}());