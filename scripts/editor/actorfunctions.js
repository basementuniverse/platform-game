Z.actorFunctions = (function() {
	"use strict";
	
	// Actor type names
	var actorTypeNames = {
		block: "Block",
		character: "Character",
		decoration: "Decoration",
		door: "Door",
		platform: "Moving Platform",
		powerup: "Powerup"
	};
	
	// Check the list of entities for any references to the actor, remove any references and
	// return a list of entities that link to the actor
	var checkEntityReferences = function(actor, entities) {
		var references = [];
		for (var i = entities.length; i--;) {
			if (entities[i].actorId && entities[i].actorId == actor.id) {
				entities[i].actorId = "";
				references.push(entities[i]);
			}
		}
		return references;
	};
	
	// Check the list of lights for any references to the actor, remove any references and
	// return a list of lights that are connected to the actor
	var checkLightReferences = function(actor, lights) {
		var references = [];
		for (var i = lights.length; i--;) {
			if (lights[i].actorId && lights[i].actorId == actor.id) {
				lights[i].actorId = "";
				references.push(lights[i]);
			}
		}
		return references;
	};
	
	// Add editor-specific methods to the actor object when all scripts have finished loading
	$(document).ready(function() {
		// Return this actor's base type name
		Z.actor.getTypeName = function() {
			return actorTypeNames[this.baseType];
		};
		
		// Return a snapshot of this actor's position and size
		Z.actor.getSnapshot = function() {
			return {
				item: this,
				position: vec2(this.position),
				size: vec2(this.size)
			};
		};
		
		// Set this actor's position and size from the specified snapshot
		Z.actor.setSnapshot = function(snapshot) {
			this.position = snapshot.position;
			this.size = snapshot.size;
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Set this platform actor's first waypoint position from the specified snapshot
		Z.platform.setSnapshot = function(snapshot) {
			Z.actor.setSnapshot.apply(this, arguments);
			this.wayPoints[0].target = snapshot.position;
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Add waypoint markers for this platform to the current map's entities list
		Z.platform.createWayPointMarkers = function() {
			var id = "",
				marker = null;
			for (var i = 1, length = this.wayPoints.length; i < length; i++) {
				id = this.id + "_waypoint" + i;
				marker = Z.platformWayPointMarker.create(id, this, this.wayPoints[i], i);
				Z.editor.map.entities.push(marker);
				Z.editor.map.entitiesById[id] = marker;
			}
		};
		
		// Handle select/deselect
		Z.actor.handleSelect = function() { };
		Z.actor.handleDeselect = function() { };
		
		// Handle actor dragging when using the select tool
		//	selection:	A reference to the item selection object containing the currently selected
		//				item and the click offset
		Z.actor.handleDrag = function(selection) {
			// Move actor
			this.position = vec2.map(
				vec2.sub(Z.input.mouseWorldPosition, selection.selectionOffset),
				Math.floor
			);
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle actor movement using the keyboard
		Z.actor.handleMove = function(moveVector) {
			// Move actor
			this.position = vec2.map(
				vec2.add(this.position, moveVector),
				Math.floor
			);
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle platform actor dragging when using the select tool
		//	selection:	A reference to the item selection object containing the currently selected
		//				item and the click offset
		Z.platform.handleDrag = function(selection) {
			Z.actor.handleDrag.apply(this, arguments);
			
			// Move the first waypoint
			this.wayPoints[0].target = this.position;
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Remove this actor from the currently loaded map
		Z.actor.remove = function() {
			var actor = this,
				map = Z.editor.map,
				entityReferences = [],
				lightReferences = [];
			
			// Prompt before removing the actor
			Z.prompt.show(
				"Are you sure you want to delete this actor?",
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							Z.actionList.performAction(
								"delete actor " + actor.id,
								function() {
									// Find actor index in map actors list and remove the actor
									var index = map.actors.findIndex(function(v) {
										return v.id == actor.id;
									});
									map.actors.splice(index, 1);
									delete map.actorsById[actor.id];
									
									// Get a list of references to this actor
									entityReferences = checkEntityReferences(actor, map.entities);
									lightReferences = checkLightReferences(actor, map.lights);
									
									// Un-select the actor
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
									// Re-add the actor to the current map
									map.actors.push(actor);
									map.actorsById[actor.id] = actor;
									
									// If there were any references to this actor in this map's
									// entities or lights, replace the references
									for (var i = entityReferences.length; i--;) {
										entityReferences[i].actorId = actor.id;
									}
									for (var i = lightReferences.length; i--;) {
										lightReferences[i].actorId = actor.id;
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