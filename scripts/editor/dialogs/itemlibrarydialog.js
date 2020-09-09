Z.itemLibraryDialog = (function() {
	"use strict";
	
	var ITEM_BUTTON_SIZE = 32,		// The size of item buttons
		ICON_SIZE = vec2(30, 30),	// The size of each icon tile in the icon sheet
		ICONS = [					// Entity and light icons (in icon sheet order)
			"actorstate",
			"actorspawn",
			"actorhealth",
			"camerashake",
			"cameratarget",
			"caption",
			"collision",
			"counter",
			"damage",
			"delay",
			"force",
			"global",
			"inventory",
			"jump",
			"latch",
			"lightstate",
			"maptransition",
			"move",
			"nand",
			"or",
			"particle",
			"powerup",
			"sound",
			"music",
			"timer",
			"use",
			"point",
			"spot",
			"ambient"
		];
	
	var _initialised = false;		// True if the dialog has already been initialised
	
	// Generate a unique sequential id with the specified prefix
	var generateUniqueId = function(currentItems, prefix) {
		var n = 0;
		while (currentItems[prefix + ++n]) {}
		return prefix + n;
	};
	
	// Create and return an actor of the specified type and at the specified position
	var createActorInstance = function(type, position) {
		var id = generateUniqueId(Z.editor.map.actorsById, type),
			data = Z[Z.actorTypes[Z.content.items[type].baseType]].getEmptyData(id, type, position);
		return Z.actorFactory.create(data);
	};
	
	// Create and return an entity of the specified type and at the specified position
	var createEntityInstance = function(type, position) {
		var id = generateUniqueId(Z.editor.map.entitiesById, type),
			data = Z[Z.entityTypes[type]].getEmptyData(id, type, position);
		return Z.entityFactory.create(data);
	};
	
	// Create and return a light of the specified type and at the specified position
	var createLightInstance = function(type, position) {
		var id = generateUniqueId(Z.editor.map.lightsById, type),
			data = Z[Z.lightTypes[type]].getEmptyData(id, type, position);
		return Z.lightFactory.create(data);
	};
	
	// Initialise item placement for the specified item type
	//	constructorType:	The constructor/factory to use (actor, entity or light)
	//	itemType:			The item's content type
	//	imageData:			Icon image data to use as the cursor when placing the item
	var placeItem = function(constructorType, itemType, imageData) {
		Z.editor.selectToolMode = Z.editorSelectToolMode.place;
		
		// De-select any currently selected items
		Z.itemSelection.select(null);
		
		// Add a class to the editor container to indicate that an item is being placed
		$("div.editor").addClass("placeitem");
		
		// Set the cursor pointer to the item's image
		if (imageData) {
			$("canvas#editor").css("cursor", "url(" + imageData + "), auto");
		}
		
		// Create a function for placing the item in the clicked map position. This function should
		// take two arguments: the clicked position (as vec2) and a boolean to indicate if the
		// placement should be cancelled (if true)
		Z.editor.addItem = function(position, cancel) {
			if (!cancel) {
				// Keep a reference to the created item's data in this closure's context so it can
				// be restored if the add action is un-done and then re-done
				var item = null,
					list = "";
				switch (constructorType) {
					case "actor":
						list = "actors";
						item = createActorInstance(itemType, position);
						break;
					case "entity":
						list = "entities";
						item = createEntityInstance(itemType, position);
						break;
					case "light":
						list = "lights";
						item = createLightInstance(itemType, position);
						break;
					default: break;
				}
				
				// Don't continue if there is no item to create
				if (!item) { return; }
				
				// Add the new item
				Z.actionList.performAction(
					"add item",
					function() {
						// Add the item to the current map
						Z.editor.map[list].push(item);
						Z.editor.map[list + "ById"][item.id] = item;
						
						// Select the created item
						Z.itemSelection.select(item);
						
						// Set map to dirty so it's data will be written to the world when the
						// editor map is changed
						Z.editor.map.dirty = true;
						
						// Update the item list toolpanel
						Z.itemListToolPanel.update();
						
						// Re-draw editor canvas
						Z.editor.draw();
					},
					function() {
						// Remove the item from the current map
						var index = Z.editor.map[list].findIndex(function(v) {
							return v.id == item.id;
						});
						Z.editor.map[list].splice(index, 1);
						delete Z.editor.map[list + "ById"][item.id];
						
						// If the item being removed is selected, unselect it
						if (Z.editor.selectedItem && Z.editor.selectedItem.item.id == item.id) {
							Z.itemSelection.select(null);
						}
						
						// Set map to dirty so it's data will be written to the world when the
						// editor map is changed
						Z.editor.map.dirty = true;
						
						// Update the item list toolpanel
						Z.itemListToolPanel.update();
						
						// Re-draw editor canvas
						Z.editor.draw();
					}
				);
			}
			
			// Remove editor class
			$("div.editor").removeClass("placeitem");
			
			// Remove add item callback and reset select tool sub-mode
			Z.editor.selectToolMode = null;
			Z.editor.addItem = null;
			
			// Reset cursor
			$("canvas#editor").css("cursor", "");
		};
	};
	
	// Create and return an item button element for an actor
	var createActorButton = function(actorType) {
		var actorData = Z.content.items[actorType];
		
		// Use the actor's sprite image as the button icon (using the idle animation, first frame)
		var sprite = Z.sprite.create(actorData.spriteData),
			scale = Math.clamp(ITEM_BUTTON_SIZE / Math.max(sprite.tileSize.X, sprite.tileSize.Y)),
			offset = vec2.mul(
				sprite.animations["idle"].startOffset,
				sprite.tileSize
			),
			image = $("<img>")
			.attr("src", sprite.image.src)
			.css({
				height: Math.floor(sprite.image.height * scale),
				width: Math.floor(sprite.image.width * scale),
				top: -offset.Y * scale,
				left: -offset.X * scale
			}),
			containerSize = vec2(
				Math.floor(sprite.tileSize.X * scale),
				Math.floor(sprite.tileSize.Y * scale)
			),
			imageContainer = $("<div class='imagecontainer'>").css({
				height: containerSize.Y,
				width: containerSize.X,
				top: (ITEM_BUTTON_SIZE / 2) - (containerSize.Y / 2),
				left: (ITEM_BUTTON_SIZE / 2) - (containerSize.X / 2)
			});
		
		// Get sprite image data for use as a cursor when placing the item
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d"),
			imageData = null;
		canvas.width = containerSize.X;
		canvas.height = containerSize.Y;
		context.drawImage(image.get(0), -offset.X * scale, -offset.Y * scale);
		imageData = canvas.toDataURL();
		
		// Create button
		var button = $("<a class='itembutton' href='javascript:void(0)'>")
			.addClass("actorbutton type_" + actorType)
			.append(imageContainer.append(image))
			.click(function() {
				Z.dialogs.toggle("itemlibrary", false, function() {
					placeItem("actor", actorType, imageData);
				});
			})
			.attr("data-tooltip", actorData.name)
			.tooltip({
				anchorX: 0,
				anchorY: 1,
				originY: -1,
				offsetY: 10,
				className: "tooltip-arrow tooltip-arrow-up"
			});
		return button;
	};
	
	// Create and return an item button element for an entity
	var createEntityButton = function(entityType) {
		// Get entity icon for use as a cursor when placing the item
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d"),
			imageData = null,
			offset = vec2(0, -(ICONS.indexOf(entityType) * ICON_SIZE.Y));
		canvas.width = ICON_SIZE.X;
		canvas.height = ICON_SIZE.Y;
		context.drawImage(Z.content.items["iconsheet"], offset.X, offset.Y);
		imageData = canvas.toDataURL();
		
		// Create button
		var button = $("<a class='itembutton' href='javascript:void(0)'>")
			.addClass("entitybutton type_" + entityType)
			.click(function() {
				Z.dialogs.toggle("itemlibrary", false, function() {
					placeItem("entity", entityType, imageData);
				});
			})
			.attr("data-tooltip", Z.entity.getTypeName.call({ type: entityType }))
			.tooltip({
				anchorX: 0,
				anchorY: 1,
				originY: -1,
				offsetY: 10,
				className: "tooltip-arrow tooltip-arrow-up"
			});
		return button;
	};
	
	// Create and return an item button element for a light
	var createLightButton = function(lightType) {
		// Get entity icon for use as a cursor when placing the item
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d"),
			imageData = null,
			offset = vec2(0, -(ICONS.indexOf(lightType) * ICON_SIZE.Y));
		canvas.width = ICON_SIZE.X;
		canvas.height = ICON_SIZE.Y;
		context.drawImage(Z.content.items["iconsheet"], offset.X, offset.Y);
		imageData = canvas.toDataURL();
		
		// Create button
		var button = $("<a class='itembutton' href='javascript:void(0)'>")
			.addClass("lightbutton type_" + lightType)
			.click(function() {
				Z.dialogs.toggle("itemlibrary", false, function() {
					placeItem("light", lightType, imageData);
				});
			})
			.attr("data-tooltip", Z.light.getTypeName.call({ type: lightType }))
			.tooltip({
				anchorX: 0,
				anchorY: 1,
				originY: -1,
				offsetY: 10,
				className: "tooltip-arrow tooltip-arrow-up"
			});
		return button;
	};
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button cancels item creation and closes the dialog
		$(".dialog.itemlibrary .closebutton").click(function() {
			Z.dialogs.toggle("itemlibrary", false);
		});
	});
	
	var _itemLibraryDialog = {
		successCallback: null,			// An optional function to call when the dialog is
										// successfully closed
		cssClass: "showitemlibrary",	// The CSS classname to add to the document body in order
										// to display this dialog screen
		
		// Initialise the item library dialog
		initialise: function() {
			if (!_initialised) {
				// Clear current item buttons
				$(".dialog.itemlibrary .itembuttons .itembutton")
				.tooltip("destroy")
				.remove();
				
				// Create actor buttons
				var actorTypes = Object.keys(Z.actorTypes);
				for (var i in Z.content.items) {
					if (
						Z.content.items.hasOwnProperty(i) &&
						Z.content.items[i].baseType &&
						actorTypes.indexOf(Z.content.items[i].baseType) > -1
					) {
						$(".dialog.itemlibrary .itembuttons").append(createActorButton(i));
					}
				}
				
				// Create entity buttons
				for (var i in Z.entityTypes) {
					if (Z.entityTypes.hasOwnProperty(i)) {
						$(".dialog.itemlibrary .itembuttons").append(createEntityButton(i));
					}
				}
				
				// Create light buttons
				for (var i in Z.lightTypes) {
					if (Z.lightTypes.hasOwnProperty(i)) {
						$(".dialog.itemlibrary .itembuttons").append(createLightButton(i));
					}
				}
				_initialised = true;
			}
		},
		update: function(callback) { callback(); }
	};
	
	// Register dialog
	Z.dialogs.registerDialog("itemlibrary", _itemLibraryDialog);
	
	return _itemLibraryDialog;
}());