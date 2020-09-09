Z.entityFunctions = (function() {
	"use strict";
	
	var SIZE = vec2(10, 10),
		COLOUR = "white",
		BACKGROUND_ALPHA = 0.3,
		BORDER_RADIUS = 2,
		LABEL_OFFSET = vec2(0, -28),
		LABEL_HEIGHT = 8,
		LABEL_PADDING = 2,
		LABEL_BACKGROUND = "rgba(80, 80, 80, 0.9)",
		LABEL_COLOUR = "white",
		LABEL_FONT = "bold 6pt Calibri, Verdana, sans-serif";
	
	// Entity type names
	var entityTypeNames = {
		playerstart: "Player Start",
		platformwaypoint: "",
		or: "OR Gate",
		nand: "NAND Gate",
		latch: "Latch",
		delay: "Delay",
		timer: "Timer",
		counter: "Counter",
		collision: "Collision",
		use: "Use",
		jump: "Jump",
		move: "Move",
		powerup: "Powerup",
		inventory: "Inventory",
		damage: "Damage",
		force: "Force",
		particle: "Particle Emitter",
		actorstate: "Actor State",
		actorspawn: "Actor Spawn",
		actorhealth: "Actor Health",
		lightstate: "Light State",
		caption: "Caption",
		maptransition: "Map Transition",
		camerashake: "Camera Shake",
		cameratarget: "Camera Target",
		sound: "Sound",
		music: "Music",
		global: "Global Flag"
	};
	
	// Check if lines l1 and l2 intersect and return the intersection position, or return null
	// if they don't intersect
	var lineIntersection = function(l1start, l1end, l2start, l2end) {
		var s1 = vec2.sub(l1end, l1start),
			s2 = vec2.sub(l2end, l2start),
			s = (-s1.Y * (l1start.X - l2start.X) + s1.X * (l1start.Y - l2start.Y)) /
				(-s2.X * s1.Y + s1.X * s2.Y),
			t = (s2.X * (l1start.Y - l2start.Y) - s2.Y * (l1start.X - l2start.X)) /
				(-s2.X * s1.Y + s1.X * s2.Y);
		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			return vec2.add(l1start, vec2.mul(s1, t));
		}
		return null;
	};
	
	// Check if a line (start -> end) intersects with a rectangle's outline (defined by position
	// and size) and return the intersection position, or return null if they don't intersect
	var rectangleIntersection = function(position, size, start, end) {
		var corners = [
				position,
				vec2.add(position, vec2(size.X, 0)),
				vec2.add(position, size),
				vec2.add(position, vec2(0, size.Y))
			],
			lines = [
				{ start: 0, end: 1 },
				{ start: 1, end: 2 },
				{ start: 2, end: 3 },
				{ start: 3, end: 0 }
			],
			result = null;
		for (var i = 0, length = lines.length; i < length; i++) {
			if (result = lineIntersection(
					corners[lines[i].start],
					corners[lines[i].end],
					start,
					end
				)
			) {
				return result;
			}
		}
		return result;
	};
	
	// Check the list of entities for any entities that have the specified entity as an input,
	// remove any references and return a list of matching entities
	var checkEntityReferences = function(entity, entities) {
		var references = [],
			inputIndex = -1,
			inputIdIndex = -1;
		
		// Check if any entities have the current selected entity as an input
		for (var i = entities.length; i--;) {
			if (entities[i].id == entity.id) { continue; }
			
			// Find the specified entity's id in the current entity's list of inputs
			inputIndex = entities[i].inputs.findIndex(function(v) {
				return v.id == entity.id;
			});
			inputIdIndex = entities[i].inputIds.indexOf(entity.id);
			if (inputIndex > -1 && inputIdIndex > -1) {
				entities[i].inputs.splice(inputIndex, 1);
				entities[i].inputIds.splice(inputIdIndex, 1);
				references.push(entities[i]);
			}
		}
		return references;
	};
	
	// Add editor-specific methods to the entity object when all scripts have finished loading
	$(document).ready(function() {
		// Return this entity's type name
		Z.entity.getTypeName = function() {
			return entityTypeNames[this.type];
		};
		
		// Return a snapshot of this entity
		Z.entity.getSnapshot = function() {
			return {
				item: this,
				position: vec2(this.position),
				size: this.size ? vec2(this.size) : null
			};
		};
		
		// Set this entity's position and size (if available) from the specified snapshot
		Z.entity.setSnapshot = function(snapshot) {
			this.position = snapshot.position;
			if (snapshot.size) {
				this.size = snapshot.size;
			}
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle select/deselect
		Z.entity.handleSelect = function() { };
		Z.entity.handleDeselect = function() { };
		
		// Handle entity dragging when using the select tool
		//	selection:	A reference to the item selection object containing the currently selected
		//				item and the click offset
		Z.entity.handleDrag = function(selection) {
			// Move entity
			this.position = vec2.map(
				vec2.sub(Z.input.mouseWorldPosition, selection.selectionOffset),
				Math.floor
			);
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle entity movement using the keyboard
		Z.entity.handleMove = function(moveVector) {
			// Move entity
			this.position = vec2.map(
				vec2.add(this.position, moveVector),
				Math.floor
			);
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Draw an entity in the editor
		Z.entity.draw = function(context) {
			var size = this.size || SIZE;
			context.save();
			context.lineWidth = 1;
			context.fillStyle = COLOUR;
			context.strokeStyle = COLOUR;
			
			// If this entity has any inputs, draw arrows from input entities to this entity
			var inputSize = null,
				start = null,
				end = vec2.add(this.position, vec2.div(size, 2)),
				actualStart = null,
				actualEnd = null;
			for (var i = this.inputs.length; i--;) {
				inputSize = this.inputs[i].size || SIZE;
				start = vec2.add(this.inputs[i].position, vec2.div(inputSize, 2));
				
				// Calculate the actual start and end points using the entity size
				actualStart = rectangleIntersection(this.inputs[i].position, inputSize, start, end);
				actualEnd = rectangleIntersection(this.position, size, start, end);
				Z.utilities.drawArrow(context, actualStart || start, actualEnd || end);
			}
			
			// Draw an outline box for this entity
			Z.utilities.strokeRoundedRectangle(context, this.position, size, BORDER_RADIUS);
			context.restore();
		};
		
		// Draw a filled entity
		var drawFilled = function(context) {
			context.save();
			context.globalAlpha = BACKGROUND_ALPHA;
			context.fillStyle = COLOUR;
			Z.utilities.fillRoundedRectangle(context, this.position, this.size, BORDER_RADIUS);
			context.restore();
			Z.entity.draw.apply(this, arguments);
		};
		Z.collisionMarker.draw = drawFilled;
		Z.particleEmitterTrigger.draw = drawFilled;
		
		// Handle entity resizing when using the select tool
		var handleResize = function() {
			var delta = vec2.mul(
					vec2.sub(Z.input.mouseWorldPosition, Z.itemResize.resizeOffset),
					Z.itemResize.direction
				),
				maxPosition = vec2.add(
					Z.itemResize.initialPosition,
					vec2.sub(Z.itemResize.initialSize, Z.itemResize.minimumSize)
				);
			this.size = vec2.map(
				vec2.add(Z.itemResize.initialSize, delta),
				Math.max,
				Z.itemResize.minimumSize
			);
			
			// If the resize direction in either axis is negative, move the item in that axis
			if (Z.itemResize.direction.X < 0) {
				this.position.X = Math.min(Z.itemResize.initialPosition.X - delta.X, maxPosition.X);
			}
			if (Z.itemResize.direction.Y < 0) {
				this.position.Y = Math.min(Z.itemResize.initialPosition.Y - delta.Y, maxPosition.Y);
			}
			
			// Set map to dirty so it's data will be written to the world when the editor map
			// is changed
			Z.editor.map.dirty = true;
		};
		
		// Handle collision marker resizing when using the select tool
		Z.collisionMarker.hasResize = true;
		Z.collisionMarker.handleResize = handleResize;
		
		// Handle particle emitter resizing when using the select tool
		Z.particleEmitterTrigger.hasResize = true;
		Z.particleEmitterTrigger.handleResize = handleResize;
		
		// Draw an entity linked to an actor
		var drawActorLinkedEntity = function(context) {
			var size = this.size || SIZE,
				start = vec2.add(this.position, vec2.div(size, 2)),
				end = null,
				actualStart = null,
				actualEnd = null,
				actor = null;
			
			// Get a reference to the target actor or the player start entity
			if (this.actorId) {
				if (this.actorId == "player") {
					actor = Z.editor.map.entitiesById["playerstart"];
				} else if (Z.editor.map.actorsById[this.actorId]) {
					actor = Z.editor.map.actorsById[this.actorId];
				}
			}
			
			// Get a reference to the target actor and draw an arrow to the actor
			if (actor) {
				end = vec2.add(actor.position, vec2.div(actor.size, 2));
				
				// Calculate actual start and end points using entity and target actor size
				actualStart = rectangleIntersection(this.position, size, start, end);
				actualEnd = rectangleIntersection(actor.position, actor.size, start, end);
				
				// Draw arrow
				context.save();
				context.fillStyle = COLOUR;
				context.strokeStyle = COLOUR;
				Z.utilities.drawArrow(context, actualStart || start, actualEnd || end);
				context.restore();
			}
			Z.entity.draw.apply(this, arguments);
		};
		Z.actorHealthTrigger.draw = drawActorLinkedEntity;
		Z.actorStateTrigger.draw = drawActorLinkedEntity;
		Z.cameraTargetTrigger.draw = drawActorLinkedEntity;
		
		// Draw a light state trigger entity in the editor
		Z.lightStateTrigger.draw = function(context) {
			var entitySize = this.size || SIZE,
				lightSize = vec2(10, 10),
				start = vec2.add(this.position, vec2.div(entitySize, 2)),
				end = null,
				actualStart = null,
				actualEnd = null,
				light = null;
			
			// Get a reference to the target light and draw an arrow to the light (if it is a point
			// or spotlight)
			if (Z.editor.map.lightsById[this.lightId]) {
				light = Z.editor.map.lightsById[this.lightId];
				if (light.type != "ambient") {
					end = light.position;
					
					// Calculate actual start and end points using entity and target light size
					actualStart = rectangleIntersection(this.position, entitySize, start, end);
					actualEnd = rectangleIntersection(
						vec2.sub(light.position, vec2.div(lightSize, 2)),
						lightSize,
						start,
						end
					);
					
					// Draw arrow
					context.save();
					context.fillStyle = COLOUR;
					context.strokeStyle = COLOUR;
					Z.utilities.drawArrow(context, actualStart || start, actualEnd || end);
					context.restore();
				}
			}
			Z.entity.draw.apply(this, arguments);
		};
		
		// Draw a label for this entity in the editor
		Z.entity.drawLabel = function(context) {
			var size = this.size || SIZE,
				label = this.getTypeName(),
				labelWidth = 0,
				labelPosition = vec2.add(LABEL_OFFSET, vec2(size.X / 2, LABEL_HEIGHT));
			
			// If the label is empty, don't draw a label
			if (!label) { return; }
			context.save();
			context.font = LABEL_FONT;
			
			// Get label width using the label font and center the label
			labelWidth = context.measureText(label).width;
			labelPosition.X -= labelWidth / 2;
			
			// Draw label background
			context.fillStyle = LABEL_BACKGROUND;
			context.translate(this.position.X, this.position.Y);
			Z.utilities.fillRoundedRectangle(
				context,
				vec2.sub(labelPosition, LABEL_PADDING),
				vec2.add(vec2(labelWidth, LABEL_HEIGHT), LABEL_PADDING * 2),
				BORDER_RADIUS
			);
			
			// Draw label text
			context.fillStyle = LABEL_COLOUR;
			context.textBaseline = "middle";
			context.fillText(label, labelPosition.X, labelPosition.Y + 3);
			context.restore();
		};
		
		// Remove this entity from the currently loaded map
		Z.entity.remove = function() {
			var entity = this,
				map = Z.editor.map,
				entityReferences = [];
			
			// Prompt before removing the entity
			Z.prompt.show(
				"Are you sure you want to delete this entity?",
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							Z.actionList.performAction(
								"delete entity " + entity.id,
								function() {
									// Find entity index in map entities list and remove the entity
									var index = map.entities.findIndex(function(v) {
										return v.id == entity.id;
									});
									map.entities.splice(index, 1);
									delete map.entitiesById[entity.id];
									
									// Check if any entities have the current selected entity as
									// an input
									entityReferences = checkEntityReferences(entity, map.entities);
									
									// Un-select the entity
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
									// Re-add the entity to the current map
									map.entities.push(entity);
									map.entitiesById[entity.id] = entity;
									
									// If any other entities in this map had this entity as an
									// input, replace the reference
									for (var i = entityReferences.length; i--;) {
										entityReferences[i].inputs.push(entity);
										entityReferences[i].inputIds.push(entity.id);
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