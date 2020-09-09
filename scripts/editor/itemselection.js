Z.itemSelection = (function() {
	"use strict";
	
	var SELECTION_COLOUR = "rgba(255, 255, 255, 0.75)",
		SELECTION_WIDTH = 2,
		HOVER_COLOUR = "rgba(255, 255, 255, 0.4)",
		HOVER_WIDTH = 2,
		BORDER_RADIUS = 2,
		ITEM_MARGIN = 4,
		ENTITY_SIZE = vec2(10, 10),
		LIGHT_SIZE = vec2(10, 10),
		MOVE_SPEED = 30,		// The speed (in pixels per second) to use when moving items
		MOVE_RATE = 60;			// The loop speed for moving items (iterations per second)
	
	var _draggingItem = false,	// True if an actor or entity is currently being dragged
		_itemSnapshots = [];	// A stack of item snapshots (used for item drag actions)
	
	// Check if the mouse pointer is over any actors, entities or lights in the specified map and
	// return a reference to the hovered item if so, otherwise return null
	var checkItems = function(mouse, map) {
		var tl = null,
			br = null,
			size = null;
		
		// Check lights (unless lights are currently hidden in the editor)
		if (Z.editor.show.lighting) {
			for (var i = map.lights.length; i--;) {
				if (map.lights[i].type == "ambient") { continue; }	// Cannot select ambient lights
				size = vec2.div(LIGHT_SIZE, 2);
				tl = vec2.sub(map.lights[i].position, vec2.add(size, ITEM_MARGIN));
				br = vec2.add(vec2.add(tl, LIGHT_SIZE), ITEM_MARGIN * 2);
				if (mouse.X >= tl.X && mouse.X <= br.X && mouse.Y >= tl.Y && mouse.Y <= br.Y) {
					return map.lights[i];
				}
			}
		}
		
		// Check entities (unless entities are currently hidden in the editor)
		if (Z.editor.show.entities) {
			for (var i = map.entities.length; i--;) {
				// Platform waypoint markers are centered on their position
				if (map.entities[i].type == "platformwaypoint") {
					size = vec2.div(ENTITY_SIZE, 2);
					tl = vec2.sub(map.entities[i].position, vec2.add(size, ITEM_MARGIN));
					br = vec2.add(vec2.add(tl, ENTITY_SIZE), ITEM_MARGIN * 2);
				
				// Other entities are anchored at their top left corner (and have arbitrary size)
				} else {
					size = map.entities[i].size || ENTITY_SIZE;
					tl = vec2.sub(map.entities[i].position, ITEM_MARGIN);
					br = vec2.add(vec2.add(tl, size), ITEM_MARGIN * 2);
				}
				if (mouse.X >= tl.X && mouse.X <= br.X && mouse.Y >= tl.Y && mouse.Y <= br.Y) {
					return map.entities[i];
				}
			}
		}
		
		// Check actors (unless actors are currently hidden in the editor)
		if (Z.editor.show.actors) {
			for (var i = map.actors.length; i--;) {
				tl = vec2.sub(map.actors[i].position, ITEM_MARGIN);
				br = vec2.add(vec2.add(tl, map.actors[i].size), ITEM_MARGIN * 2);
				if (mouse.X >= tl.X && mouse.X <= br.X && mouse.Y >= tl.Y && mouse.Y <= br.Y) {
					return map.actors[i];
				}
			}
		}
		return null;
	};
	
	return {
		item: null,					// The selected/hovered item
		selected: false,			// True if this item is selected
		selectionOffset: vec2(),	// The mouse offset from the item's position
		itemMoveVector: vec2(),		// Move vector for moving the selected item with the keyboard
		itemMoveLoop: null,			// A handle to the keyboard movement loop
		create: function(item, selected, offset) {
			var i = Object.create(this);
			i.item = item;
			i.selected = !!selected;
			i.selectionOffset = offset;
			return i;
		},
		
		// Handle mouse hover and item selection and dragging
		handleMouseInput: function(down, clicked) {
			// If there is no currently loaded map in the editor, don't check for hover/selection
			if (!Z.editor.map) { return; }
			
			// Get a reference to any item that the mouse is currently over
			var item = checkItems(Z.input.mouseWorldPosition, Z.editor.map);
			
			// Show the hovered item's id as a tooltip
			$("canvas#editor").data("tooltip", item ? item.id : "").tooltip("update");
			
			// Add a class to the editor container element if an item is selected and the user is 
			// hovering over the selected item to indicate that the item can be moved
			$("div.editor").toggleClass(
				"moveitemtool",
				!!(item && Z.editor.selectedItem && Z.editor.selectedItem.item.id == item.id)
			);
			
			// If the mouse is clicked, update or remove the currently selected item
			if (clicked) {
				this.select(item);
				if (item) {
					_draggingItem = true;
					_itemSnapshots.push(item.getSnapshot());
				}
			
			// Otherwise, if the mouse button is already down and there is a selected item, allow
			// the item to be dragged
			} else if (down && Z.editor.selectedItem) {
				Z.editor.selectedItem.item.handleDrag(Z.editor.selectedItem);
			}
			
			// If the mouse button is not currently down, show the currently hovered item
			if (!clicked && !down) {
				Z.toolCursor.hoveredItem = item ? Z.itemSelection.create(item, false) : null;
				
				// When the user releases the mouse button after dragging an item, get a snapshot
				// of the updated item and add an action to the action list
				if (_draggingItem) {
					_draggingItem = false;
					var before = _itemSnapshots.pop(),
						after = before.item.getSnapshot();
					
					// If the item's position was changed, create an action
					if (!vec2.eq(before.position, after.position)) {
						Z.actionList.performAction(
							"move " + before.item.id,
							function() {
								before.item.setSnapshot(after);
								Z.editor.draw();
							},
							function() {
								before.item.setSnapshot(before);
								Z.editor.draw();
							},
							true
						);
					}
				}
			}
		},
		
		// Handle keyboard input for moving and deleting items
		handleKeyboardInput: function(key, down) {
			// If there is no currently loaded map in the editor, don't check for selection
			if (!Z.editor.map) { return; }
			
			// Don't try to move ambient lights
			if (Z.editor.selectedItem && Z.editor.selectedItem.type == "ambient") { return; }
			
			// Check that the select tool is active and that there is a selected item
			if (Z.editor.tool == Z.editorTool.select && Z.editor.selectedItem) {
				var speed = MOVE_SPEED / (1000 / MOVE_RATE);
				if (Z.input.checkControl(key, "up")) {
					this.itemMoveVector.Y = down ? -speed : 0;
				} else if (Z.input.checkControl(key, "down")) {
					this.itemMoveVector.Y = down ? speed : 0;
				}
				if (Z.input.checkControl(key, "left")) {
					this.itemMoveVector.X = down ? -speed : 0;
				} else if (Z.input.checkControl(key, "right")) {
					this.itemMoveVector.X = down ? speed : 0;
				}
			} else {
				this.itemMoveVector = vec2();
			}
			
			// If an arrow key was pressed, start the item move loop
			if (
				Z.editor.selectedItem &&
				down &&
				!this.itemMoveLoop &&
				(this.itemMoveVector.X || this.itemMoveVector.Y)
			) {
				// Push a snapshot of the item's initial position
				_itemSnapshots.push(Z.editor.selectedItem.item.getSnapshot());
				
				// Start the item move loop
				this.itemMoveLoop = setInterval(function() {
					Z.editor.selectedItem.item.handleMove(Z.itemSelection.itemMoveVector);
					Z.editor.draw();
				}, 1000 / MOVE_RATE);
			}
			
			// Cancel the item move loop if there is no move vector
			if (!this.itemMoveVector.X && !this.itemMoveVector.Y) {
				clearTimeout(this.itemMoveLoop);
				this.itemMoveLoop = null;
				
				// Get a snapshot of the item's new position
				var before = _itemSnapshots.pop();
				if (before) {
					var after = before.item.getSnapshot();
					
					// If the item's position was changed, create an action
					if (!vec2.eq(before.position, after.position)) {
						Z.actionList.performAction(
							"move " + before.item.id,
							function() {
								before.item.setSnapshot(after);
								Z.editor.draw();
							},
							function() {
								before.item.setSnapshot(before);
								Z.editor.draw();
							},
							true
						);
					}
				}
			}
		},
		
		// Select an actor or entity, or de-select the currently selected item
		select: function(item) {
			// Notify the current selected item (if there is one) if it has been de-selected
			if (Z.editor.selectedItem) {
				if (!item || Z.editor.selectedItem.item.id != item.id) {
					Z.editor.selectedItem.item.handleDeselect();
				}
			}
			if (item) {
				Z.editor.selectedItem = Z.itemSelection.create(
					item,
					true,
					vec2.sub(Z.input.mouseWorldPosition, item.position || vec2())
				);
				
				// Notify the item that it has been selected
				item.handleSelect();
				
				// Add a class to the editor container element to indicate that an item is selected
				$("div.editor").addClass("itemselected");
			} else {
				Z.editor.selectedItem = null;
				
				// Remove classes from the editor container element to hide tool cursors and panels
				$("div.editor").removeClass(
					"itemselected moveitemtool resizeitemtool showitemproperties"
				);
			}
			
			// Update the selected item toolpanel
			Z.itemListToolPanel.updateSelected();
			Z.selectedItemToolPanel.update();
		},
		
		// Remove the currently selected item
		remove: function() {
			// Player start marker cannot be deleted
			if (Z.editor.selectedItem.item.type == "playerstart") { return; }
			Z.editor.selectedItem.item.remove();
		},
		
		// Draw a selection/hover border around the selected item
		draw: function(context) {
			// Don't try to draw ambient lights
			if (this.item.type == "ambient") { return; }
			
			context.save();
			context.strokeStyle = this.selected ? SELECTION_COLOUR : HOVER_COLOUR;
			context.lineWidth = this.selected ? SELECTION_WIDTH : HOVER_WIDTH;
			context.translate(this.item.position.X, this.item.position.Y);
			
			// If this item is a light, draw the selection border centered on the light position
			if (this.item.type == "point" || this.item.type == "spot") {
				Z.utilities.strokeRoundedRectangle(
					context,
					vec2(-LIGHT_SIZE.X / 2 - ITEM_MARGIN, -LIGHT_SIZE.Y / 2 - ITEM_MARGIN),
					vec2.add(LIGHT_SIZE, ITEM_MARGIN * 2),
					BORDER_RADIUS
				);
				
			// If this item is a platform waypoint marker, draw the selection border centered on
			// the waypoint position
			} else if (this.item.type == "platformwaypoint") {
				Z.utilities.strokeRoundedRectangle(
					context,
					vec2(-ENTITY_SIZE.X / 2 - ITEM_MARGIN, -ENTITY_SIZE.Y / 2 - ITEM_MARGIN),
					vec2.add(ENTITY_SIZE, ITEM_MARGIN * 2),
					BORDER_RADIUS
				);
				
			// Otherwise, use the selected actor or entity's size (or default entity size
			// for entities that don't have a size)
			} else {
				var size = this.item.size || ENTITY_SIZE;
				Z.utilities.strokeRoundedRectangle(
					context,
					vec2(-ITEM_MARGIN, -ITEM_MARGIN),
					vec2.add(size, ITEM_MARGIN * 2),
					BORDER_RADIUS
				);
			}
			context.restore();
		}
	};
}());