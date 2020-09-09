Z.editor = (function() {
	"use strict";
	
	var _canvas = null,
		_context = null,
		_editorElement = null,
		_toolbarHeight = 0,
		_statusbarHeight = 0,
		_previousTool = null,
		_previousTileType = "0",
		_sampleTileType = false;
	
	// Initialise and start editor (called by content loader)
	var start = function(content) {
		// Initialise tool mode to select tool
		Z.toolbar.setEditorTool(Z.editorTool.select);
		
		// Prompt the user if the browser window is closed/refreshed and there are unsaved changes
		$(window).bind("beforeunload", function(e) {
			if (Z.editor.dirty) {
				return "There are unsaved changes.";
			}
		});
		
		// Initialise input manager
		Z.input.initialise(vec2(0, _toolbarHeight));
		
		// Initialise world
		Z.world.initialise();
		
		// Create starting map
		if (Z.world.startingMap && Z.world.maps[Z.world.startingMap]) {
			Z.editor.map = Z.map.create(
				Z.world,
				Z.world.startingMap,
				Z.world.maps[Z.world.startingMap]
			);
			
			// Add the player start marker
			var playerStartMarker = Z.playerStartMarker.create(Z.editor.map.playerStartingPosition);
			Z.editor.map.entities.push(playerStartMarker);
			Z.editor.map.entitiesById["playerstart"] = playerStartMarker;
			
			// Add platform waypoint markers
			for (var i = 0, length = Z.editor.map.actors.length; i < length; i++) {
				if (Z.editor.map.actors[i].baseType == "platform") {
					Z.editor.map.actors[i].createWayPointMarkers();
				}
			}
		}
		
		// Initialise map select menu
		Z.menuSelector.initialise.currentMap();
		
		// Initialise camera position to player starting position and draw the map
		Z.camera.initialise(Z.editor.map ? Z.editor.map.playerStartingPosition : vec2());
		Z.editor.draw();
		
		// Initialise status bar
		Z.statusBar.initialise();
		
		// Update toolpanels
		Z.itemListToolPanel.update();
		Z.tileToolPanel.update();
		
		// Notify the document that the editor has finished loading content
		$(document).trigger("finishedloading");
	};
	
	return {
		worldData: {			// Stores world metadata
			id: "",
			name: "",
			description: "",
			private: false
		},
		tool: null,				// Currently selected tool
		selectToolMode: null,	// Current select tool sub-mode (if select tool is active)
		addItemType: "",		// The item type to add when the 'place' select tool sub-mode is
								// active and the user clicks on the map
		dirty: false,			// True if there are unsaved changes in the current world
		map: null,				// The map currently being edited
		selectedItem: null,		// The currently selected actor or entity (if select tool is active)
		selectedTileType: "0",	// The currently selected tile type id (if tile tool is active)
		show: {					// Show/hide certain parts of the current map
			tileGrid: false,
			collisionEdges: false,
			background: true,
			actors: true,
			entities: true,
			lighting: true
		},
		initialise: function(id) {
			// Initialise tooltips
			$("[data-tooltip], canvas#editor").tooltip();
			
			// Get a reference to the editor canvas and create a context
			_canvas = $("canvas#editor").get(0);
			if (_canvas && _canvas.getContext) {
				_context = _canvas.getContext("2d");
				
				// Get a reference to the editor container div (used for resizing the canvas)
				_editorElement = $("div.editor");
				
				// Initialise tile tool cursor canvas
				Z.toolCursor.initialise();
				
				// Get toolbar and statusbar element heights (these are subtracted from the canvas
				// height, since they appear above and below it)
				_toolbarHeight = $(".toolbar").height();
				_statusbarHeight = $(".statusbar").height();
				
				// Handle window resize
				$(window).resize(function() {
					_canvas.width = _editorElement.width();
					_canvas.height = _editorElement.height() - (_toolbarHeight + _statusbarHeight);
					
					// Resize tool cursor canvas (same dimensions as editor canvas)
					Z.toolCursor.resize(_canvas.width, _canvas.height);
					
					// Disable image smoothing for pixelated graphics
					_context.imageSmoothingEnabled = false;
					_context.webkitImageSmoothingEnabled = false;
					_context.mozImageSmoothingEnabled = false;
					
					// Redraw canvas
					Z.editor.draw();
				}).trigger("resize");
				
				// Initialise lightmap canvas
				Z.lightMap.initialiseCanvas(_editorElement, _toolbarHeight, _statusbarHeight);
				
				// Get a list of content assets from the server and start loading them
				Z.utilities.loading(true);
				$.ajax({
					dataType: "json",
					url: Z.settings.contentPath + id,
					success: function(data) {
						var contentItems = [];
						for (var i = data.items.length; i--;) {
							if (data.items[i].id == "world") {
								// Special handling for world - remove "/data" from the address and
								// pass world data through a special loader function so that meta
								// data can be stored
								contentItems.push({
									id: "world",
									loader: Z.editor.load,
									args: [
										data.items[i].args[0].replace(/\/data$/i, ""),
										data.items[i].args.length > 1 ? data.items[i].args[1] : null
									]
								});
							} else {
								contentItems.push({
									id: data.items[i].id,
									loader: Z.content.loaders[data.items[i].loader],
									args: data.items[i].args
								});
							}
						}
						
						// Load entity/light icon sheet
						contentItems.push({
							id: "iconsheet",
							loader: Z.utilities.loadImage,
							args: ["images/editor/entity_icons.png"]
						});
						
						// Load light icon
						contentItems.push({
							id: "lighticon",
							loader: Z.utilities.loadImage,
							args: ["images/editor/light.png"]
						});
						
						// Load platform waypoint icon
						contentItems.push({
							id: "platformwaypointicon",
							loader: Z.utilities.loadImage,
							args: ["images/editor/platformwaypoint.png"]
						});
						
						// Start loading content
						Z.content.load(contentItems, start);
					},
					error: function(request, status, error) {
						if (Z.settings.debug) {
							console.error(
								"Error loading main content list (%s): %O, %O",
								status, request, error
							);
						}
					}
				});
			} else {
				console.warn("Browser not supported!");
			}
		},
		
		// Custom loader loads world with included metadata (name, description, etc.) from api and
		// passes embedded world data to default world loader
		load: function(callback, path, data) {
			if (data) {	// Pass through if data is included inline (metadata won't be included)
				Z.editor.worldData.name = data.name;
				Z.world.load(callback, path, data);
				return;
			}
			
			// Otherwise get metadata before using default world loader
			Z.utilities.loadData(function(worldData) {
				Z.editor.worldData.id = worldData.World.Id;
				Z.editor.worldData.name = worldData.World.Name;
				Z.editor.worldData.description = worldData.World.Description;
				Z.editor.worldData.private = !!worldData.World.Private;
				Z.world.load(callback, path, JSON.parse(worldData.World.Data));
			}, path, null);
		},
		
		// Save world data to api with metadata included
		save: function(callback) {
			var save = function() {
				var url = Z.settings.apiPath + "worlds",
					type = "POST",
					data = JSON.stringify({
						name: Z.editor.worldData.name,
						description: Z.editor.worldData.description,
						private: Z.editor.worldData.private,
						data: JSON.stringify(Z.world.getData())
					});
				
				// If this is an existing world (ie. it has an id), try to update it instead of
				// creating a new world
				if (Z.editor.worldData.id != "") {
					url += "/" + Z.editor.worldData.id;
					type = "PUT";
				}
				
				// Send world update/create request
				Z.utilities.loading(true);
				Z.utilities.sendRequest(
					url,
					type,
					data,
					function(data) {
						Z.utilities.loading(false);
						Z.editor.worldData.id = data.World.Id;
						Z.prompt.show("World saved successfully!");
						Z.toolbar.setDirty(false);
					},
					function(response) {
						Z.prompt.show("An error occurred while saving the world. " + response);
					}
				);
			};
			
			// Check if the user is logged in to the world api
			Z.utilities.sendRequest(
				Z.settings.apiPath + "me",
				"GET",
				null,
				function(data) {
					// If a user is logged in, save the world otherwise open the login dialog and
					// save the world once the user has successfully logged in
					if (data.User && data.User.Id) {
						save();
					} else {
						Z.dialogs.toggle("login", true, save);
					}
				},
				null
			);
		},
		
		// Login to the world api using the specified username and password and call the success
		// or failed callback depending on the result
		login: function(username, password, successCallback, failedCallback) {
			Z.utilities.loading(true);
			Z.utilities.sendRequest(
				Z.settings.apiPath + "login",
				"POST",
				JSON.stringify({ username: username, password: password }),
				function(data) {
					Z.utilities.loading(false);
					successCallback();
				},
				function (request, status, error) {
					Z.utilities.loading(false);
					failedCallback();
				}
			);
		},
		
		// Load a new map into the editor
		//	mapId:			The id of the map to load
		//	resetCamera:	True if the camera should be re-initialised to the new map's player
		//					starting position
		changeMap: function(mapId, resetCamera) {
			// If changing to a different map, unselect any selected items
			if (this.selectedItem && mapId && this.map && mapId != this.map.id) {
				Z.itemSelection.select(null);
			}
			
			// Cancel item placement if there is an item being placed
			if (this.selectToolMode == Z.editorSelectToolMode.place && this.addItem) {
				this.addItem(vec2(), true);
			}
			
			// If mapId is empty, reload the current map (or ignore the request if there isn't
			// a currently loaded map)
			if (!mapId) {
				if (!this.map) { return; }
				mapId = this.map.id;
			}
			
			// If there is a currently loaded map, check if it's tile data has changed - if it has,
			// re-encode and save tile data back to the world, then dispose the map
			if (this.map) {
				//if (this.map.dirty) {
					Z.world.maps[this.map.id] = this.map.getData();
				//}
				this.map.dispose();
			}
			
			// Rebuild the specified map
			this.map = Z.map.create(Z.world, mapId, Z.world.maps[mapId]);
			
			// If we are resetting the camera, initialise the camera to the map's player starting
			// position
			if (resetCamera) {
				Z.camera.initialise(this.map.playerStartingPosition);
			}
			
			// Add the player start marker
			var playerStartMarker = Z.playerStartMarker.create(this.map.playerStartingPosition);
			this.map.entities.push(playerStartMarker);
			this.map.entitiesById["playerstart"] = playerStartMarker;
			
			// Add platform waypoint markers
			for (var i = 0, length = this.map.actors.length; i < length; i++) {
				if (this.map.actors[i].baseType == "platform") {
					this.map.actors[i].createWayPointMarkers();
				}
			}
			
			// Redraw the editor canvas
			this.draw();
			
			// Clear the tool cursor canvas
			Z.toolCursor.clear();
			
			// Update the item list toolpanel
			Z.itemListToolPanel.update();
			
			// Loading a new map invalidates all current actions
			Z.actionList.invalidate();
		},
		handleMouseInput: function(down, clicked) {
			// If there is no currently loaded map, ignore mouse input
			if (!this.map) { return; }
			
			// Select tool
			if (this.tool == Z.editorTool.select) {
				// Check if the user is placing a new item onto the map
				if (this.selectToolMode == Z.editorSelectToolMode.place && this.addItem) {
					if (down) {
						this.addItem(Z.input.mouseWorldPosition);
					}
				
				// Otherwise do item selection/dragging/resize
				} else {
					// If there is a selected item and it can be resized, handle item resize
					if (this.selectedItem && this.selectedItem.item.hasResize) {
						Z.itemResize.handleMouseInput(down, clicked);
					}
					
					// If not currently resizing an item, handle item selection and dragging
					if (!Z.itemResize.resizing) {
						Z.itemSelection.handleMouseInput(down, clicked);
					}
				}
			}
			
			// Camera move tool
			if (this.tool == Z.editorTool.move) {
				Z.camera.handleMouseInput(down, clicked);
			}
			
			// Tile tool
			if (this.tool == Z.editorTool.tile && this.selectedTileType) {
				if (_sampleTileType) {	// Sample the tile type
					if (clicked) {
						this.selectedTileType = Z.editor.map.sampleTileType(
							Z.input.mouseWorldTilePosition
						) + "";
						Z.tileToolPanel.update();
					}
				} else {				// Place/remove tiles
					this.map.handleInput(down, clicked);
				}
			}
			
			// Redraw the editor canvas if the mouse button is down or clicked
			if (down || clicked) {
				this.draw();
			}
			
			// Draw the tool cursor canvas
			Z.toolCursor.draw();
			
			// Update status bar mouse position
			Z.statusBar.updateMessage();
		},
		handleKeyboardInput: function(key, down) {
			// If a dialog is visible or any input elements have focus, ignore keyboard controls
			if (Z.dialogs.visibleDialog || Z.input.inputFocus) { return; }
			
			// Press Ctrl-S to save
			if (down && Z.input.ctrlDown && key == Keys.S) {
				$(".button.savebutton").trigger("click");
			}
			
			// Press Ctrl-Z/Ctrl-Y to undo/redo
			if (down && Z.input.ctrlDown) {
				if (key == Keys.Z) {
					$(".button.undobutton").trigger("click");
				} else if (key == Keys.Y) {
					$(".button.redobutton").trigger("click");
				}
			}
			
			// Press ESC to cancel item placement or connection
			if (
				down &&
				key == Keys.Escape &&
				this.selectToolMode == Z.editorSelectToolMode.place &&
				this.addItem
			) {
				this.addItem(vec2(), true);
			}
			
			// Temporarily change the current tool to the camera move tool (then reset the selected
			// tool when the pan camera key is released)
			if (Z.input.checkControl(key, "pancamera")) {
				if (down && this.tool != Z.editorTool.move) {
					_previousTool = this.tool;
					Z.toolbar.setEditorTool(Z.editorTool.move);
				} else if (!down) {
					Z.toolbar.setEditorTool(_previousTool);
				} 
			}
			
			// Switch to the select tool
			if (down && Z.input.checkControl(key, "selecttool")) {
				$(".button.selectbutton").trigger("click");
			}
			
			// Switch to the move camera tool
			if (down && Z.input.checkControl(key, "cameratool")) {
				$(".button.movecamerabutton").trigger("click");
			}
			
			// Switch to the tile tool
			if (down && Z.input.checkControl(key, "tiletool")) {
				$(".button.tilebutton").trigger("click");
			}
			
			// Toggle toolpanel
			if (
				down &&
				Z.input.checkControl(key, "toolpanel") &&
				!$(".button.toolpanelbutton").hasClass("disabled") &&
				!$(".button.toolpanelbutton").hasClass("dialogdisabled")
			) {
				$("div.editor").toggleClass("showtoolpanel");
			}
			
			// Hold clear tiles key when using the tile tool to place empty tiles
			if (this.tool == Z.editorTool.tile && Z.input.checkControl(key, "cleartile")) {
				if (down && this.selectedTileType != "0") {
					_previousTileType = this.selectedTileType;
					this.selectedTileType = "0";
					Z.tileToolPanel.update();
				} else if (!down) {
					this.selectedTileType = _previousTileType;
					Z.tileToolPanel.update();
				}
			}
			
			// Hold sample tiles key when using the tile tool to sample tile types
			if (this.tool == Z.editorTool.tile && Z.input.checkControl(key, "sampletile")) {
				_sampleTileType = down;
				$(".button.tilebutton").toggleClass("tilesample", _sampleTileType);
			}
			
			// Remove the currently selected item
			if (
				this.selectedItem &&
				down &&
				Z.input.checkControl(key, "deleteitem")
			) {
				this.selectedItem.remove();
			}
			
			// De-select the currently selected item
			if (
				this.selectedItem &&
				down &&
				Z.input.checkControl(key, "deselect")
			) {
				Z.itemSelection.select(null);
				Z.toolCursor.draw();
			}
			
			// Allow the selected item to be nudged with the arrow keys
			Z.itemSelection.handleKeyboardInput(key, down);
			
			// Move the camera using the arrow keys
			Z.camera.handleKeyboardInput(key, down);
		},
		draw: function() {
			_context.save();
			_context.clearRect(0, 0, _canvas.width, _canvas.height);
			if (this.map) {
				// Update camera transform
				Z.camera.update(_context, _canvas.width, _canvas.height);
				
				// Draw map and actors
				this.map.draw(_context, true);
				
				// Draw collision overlay if currently visible
				if (this.show.collisionEdges) {
					Z.collisionOverlay.draw(_context);
				}
				
				// Draw tile grid if currently visible
				if (this.show.tileGrid) {
					Z.tileGrid.draw(_context, _canvas.width, _canvas.height);
				}
			}
			_context.restore();
			
			// Re-draw the tool cursor canvas
			Z.toolCursor.draw();
			
			// Draw debug output
			Z.debug.draw(_context);
		}
	};
}());