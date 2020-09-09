Z.lightFunctions = (function() {
	"use strict";
	
	var ICON_SIZE = vec2(30, 30);
	
	// Light type names
	var lightTypeNames = {
		ambient: "Ambient Light",
		point: "Point Light",
		spot: "Spot Light"
	};
	
	// Check the list of entities for any references to the light, remove any references and
	// return a list of entities that link to the light
	var checkEntityReferences = function(light, entities) {
		var references = [];
		for (var i = entities.length; i--;) {
			if (entities[i].lightId && entities[i].lightId == light.id) {
				entities[i].lightId = "";
				references.push(entities[i]);
			}
		}
		return references;
	};
	
	// Add editor-specific methods to the light object when all scripts have finished loading
	$(document).ready(function() {
		// Return this light's type name
		Z.light.getTypeName = function() {
			return lightTypeNames[this.type];
		};
		
		// Return a snapshot of this light
		Z.light.getSnapshot = function() {
			return {
				item: this,
				position: this.position ? vec2(this.position) : null
			};
		};
		
		// Set this light's position from the specified snapshot
		Z.light.setSnapshot = function(snapshot) {
			if (this.position) {
				this.position = snapshot.position;
			}
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle select/deselect
		Z.light.handleSelect = function() { };
		Z.light.handleDeselect = function() { };
		
		// Handle light dragging when using the select tool (only point and spot lights)
		//	selection:	A reference to the item selection object containing the currently selected
		//				item and the click offset
		var handleDrag = function(selection) {
			// Move light if not attached to an actor
			if (!this.actorId) {
				this.position = vec2.map(
					vec2.sub(Z.input.mouseWorldPosition, selection.selectionOffset),
					Math.floor
				);
				
				// Set map to dirty so it's data will be written to the world when the editor map
				// is changed
				Z.editor.map.dirty = true;
			}
		};
		Z.pointLight.handleDrag = handleDrag;
		Z.spotLight.handleDrag = handleDrag;
		
		// Handle light movement using the keyboard (only point and spot lights)
		var handleMove = function(moveVector) {
			// Move light if not attached to an actor
			if (!this.actorId) {
				this.position = vec2.map(
					vec2.add(this.position, moveVector),
					Math.floor
				);
				
				// Set map to dirty so it's data will be written to the world when the editor map
				// is changed
				Z.editor.map.dirty = true;
			}
		};
		Z.pointLight.handleMove = handleMove;
		Z.spotLight.handleMove = handleMove;
		
		// Draw light icon and selection tool
		var drawTool = function(context, position, active) {
			var image = Z.content.items["lighticon"],
				height = image.height,
				width = image.width,
				position = vec2.mul(this.position, Z.settings.scale),
				offset = this.active ? 0 : ICON_SIZE.X;
			
			// Use standard scale when drawing the icon
			context.save();
			context.scale(1 / Z.settings.scale, 1 / Z.settings.scale);
			context.translate(position.X - ICON_SIZE.X / 2, position.Y - ICON_SIZE.Y / 2);
			context.drawImage(
				image,
				offset,
				0,
				ICON_SIZE.X,
				ICON_SIZE.Y,
				0,
				0,
				ICON_SIZE.X,
				ICON_SIZE.Y
			);
			context.restore();
		};
		Z.pointLight.drawTool = drawTool;
		Z.spotLight.drawTool = drawTool;
		
		// Remove this light from the currently loaded map
		Z.light.remove = function() {
			var light = this,
				map = Z.editor.map,
				entityReferences = [];
			
			// Prompt before removing the light
			Z.prompt.show(
				"Are you sure you want to delete this light?",
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							Z.actionList.performAction(
								"delete light " + light.id,
								function() {
									// Find light index in map lights list and remove the light
									var index = map.lights.findIndex(function(v) {
										return v.id == light.id;
									});
									map.lights.splice(index, 1);
									delete map.lightsById[light.id];
									
									// Get a list of references to this light
									entityReferences = checkEntityReferences(light, map.entities);
									
									// Un-select the light
									Z.itemSelection.select(null);
									
									// Re-draw the editor canvas
									Z.editor.draw();
									
									// Update the item list toolpanel
									Z.itemListToolPanel.update();
									
									// Set map to dirty so it's data will be written to the world
									// when the editor map is changed
									Z.editor.map.dirty = true;
								},
								function() {
									// Re-add the light to the current map
									map.lights.push(light);
									map.lightsById[light.id] = light;
									
									// If there were any references to this light in this map's
									// entities, replace the references
									for (var i = entityReferences.length; i--;) {
										entityReferences[i].lightId = light.id;
									}
									
									// Re-draw the editor canvas
									Z.editor.draw();
									
									// Update the item list toolpanel
									Z.itemListToolPanel.update();
									
									// Set map to dirty so it's data will be written to the world
									// when the editor map is changed
									Z.editor.map.dirty = true;
								}
							);
						}
					},
					{
						text: "No",
						cssClass: "cancelbutton",
						callback: null
					}
				]
			);
		};
	});
}());