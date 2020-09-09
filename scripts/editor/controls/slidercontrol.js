Z.sliderControl = (function() {
	"use strict";
	
	var UPDATE_DELAY = 250,		// Number of ms before update is called when the slider is changed
		PRECISION = 100;		// Value precision will be (1 / PRECISION)
	
	// Initialise slider control elements
	$(document).ready(function() {
		$(".slider")
		.each(function(k, v) {
			var callback = $(v).attr("data-callback");
			
			// If there is no callback continue to the next control
			if (!callback) { return; }
			
			// Create slider control elements
			var drag = false,
				slider = $(v),
				sliderWidth = slider.width(),
				sliderPadding = parseFloat(slider.css("padding")),
				allowNegative = slider.hasClass("negative"),
				bar = $("<div class='bar'>"),
				timeout = null,
				update = function(e) {
					// Set bar width and left offset
					if (allowNegative) {
						var offset = slider.offset(),
							click = e.clientX - offset.left,
							halfWidth = Math.round(sliderWidth / 2);
						if (click < sliderWidth / 2) {
							bar
							.offset({ left: offset.left + sliderPadding + click })
							.width(Math.clamp(halfWidth - click, 0, halfWidth))
							.addClass("negative");
						} else {
							bar
							.offset({ left: offset.left + sliderPadding + halfWidth })
							.width(Math.clamp(click - halfWidth, 0, halfWidth))
							.removeClass("negative");
						}
					} else {
						var offset = bar.offset();
						bar.width(Math.clamp(e.clientX - offset.left, 0, sliderWidth));
					}
					
					// Update value after the bar has been unchanged for some amount of time
					clearTimeout(timeout);
					timeout = setTimeout(function() {
						var value = 0;
						if (allowNegative) {
							value = bar.width() / (sliderWidth / 2);
							if (bar.hasClass("negative")) {
								value = -value;
							}
						} else {
							value = bar.width() / sliderWidth;
						}
						Z.sliderControl.update[callback](
							Math.round(Math.clamp(value, -1, 1) * PRECISION) / PRECISION
						);
					}, UPDATE_DELAY);
				};
			
			// If this slider supports negative values, add a center marker
			if (allowNegative) {
				$(v).append($("<div class='center'>"));
			}
			
			// Append bar
			$(v).append(bar);
			
			// Add mouse events handlers
			$(v)
			.mousedown(function(e) {
				drag = true;
				update(e);
			})
			.mouseup(function() { drag = false; })
			.mouseout(function() { drag = false; })
			.mousemove(function(e) {
				if (drag) {
					update(e);
				}
			});
		})
		.tooltip({
			anchorX: 0,
			anchorY: -1,
			originY: 1,
			offsetY: -10,
			className: "tooltip-arrow tooltip-arrow-down"
		});
	});
	
	// Initialise the friction slider in one of the add/edit tile type dialogs
	var initialiseTileTypeFriction = function(id) {
		var tileType = Z.world.tileTypes[Z.editor.selectedTileType];
		$("#" + id + " .bar").width(
			tileType.friction * $("#" + id).width()
		);
		
		// Update tooltip
		$("#" + id).data("tooltip", "Friction: " + tileType.friction).tooltip("update");
	};
	
	// Initialise the conveyor slider in one of the add/edit tile type dialogs
	var initialiseTileTypeConveyor = function(id) {
		var slider = $("#" + id),
			maxConveyor = parseFloat(slider.attr("data-max")),
			conveyor = 0,
			offset = slider.offset(),
			padding = parseFloat(slider.css("padding")),
			halfWidth = Math.round(slider.width() / 2);
		
		// Convert tile type's conveyor amount to range [-1...1]
		conveyor = Z.world.tileTypes[Z.editor.selectedTileType].conveyor / maxConveyor;
		
		// Resize slider
		if (conveyor < 0) {
			$("#" + id + " .bar")
			.offset({ left: offset.left + padding + halfWidth - (-conveyor * halfWidth) })
			.width(Math.clamp(-conveyor * halfWidth, 0, halfWidth))
			.addClass("negative");
		} else {
			$("#" + id + " .bar")
			.offset({ left: offset.left + padding + halfWidth })
			.width(Math.clamp(conveyor * halfWidth, 0, halfWidth))
			.removeClass("negative");
		}
		
		// Update tooltip
		slider
		.data("tooltip", "Conveyor: " + Z.world.tileTypes[Z.editor.selectedTileType].conveyor)
		.tooltip("update");
	};
	
	// Update the selected tile type's friction amount when the slider control is used in one of
	// the add/edit tile type dialogs
	var updateTileTypeFriction = function(value, id) {
		Z.world.tileTypes[Z.editor.selectedTileType].friction = value;
		
		// Update tooltip
		$("#" + id)
		.data("tooltip", "Friction: " + Z.world.tileTypes[Z.editor.selectedTileType].friction)
		.tooltip("update");
		
		// Notify the editor that changes have been made to world data
		Z.toolbar.setDirty(true);
	};
	
	// Update the selected tile type's conveyor amount when the slider control is used in one of
	// the add/edit tile type dialogs
	var updateTileTypeConveyor = function(value, id) {
		var maxConveyor = parseFloat($("#" + id).attr("data-max"));
		Z.world.tileTypes[Z.editor.selectedTileType].conveyor = Math.round(
			value * maxConveyor
		);
		
		// Update tooltip
		$("#" + id)
		.data("tooltip", "Conveyor: " + Z.world.tileTypes[Z.editor.selectedTileType].conveyor)
		.tooltip("update");
		
		// Notify the editor that changes have been made to world data
		Z.toolbar.setDirty(true);
	};
	
	return {
		initialise: {
			backgroundParallaxX: function() {
				// If there is no currently loaded map, don't initialise slider
				if (!Z.editor.map) { return; }
				$("#backgroundparallaxx .bar").width(
					Z.editor.map.background.parallax.X * $("#backgroundparallaxx").width()
				);
				
				// Update tooltip
				$("#backgroundparallaxx")
				.data("tooltip", "Parallax: " + Z.editor.map.background.parallax.X)
				.tooltip("update");
			},
			backgroundParallaxY: function() {
				// If there is no currently loaded map, don't initialise slider
				if (!Z.editor.map) { return; }
				$("#backgroundparallaxy .bar").width(
					Z.editor.map.background.parallax.Y * $("#backgroundparallaxy").width()
				);
				
				// Update tooltip
				$("#backgroundparallaxy")
				.data("tooltip", "Parallax: " + Z.editor.map.background.parallax.Y)
				.tooltip("update");
			},
			addTileTypeFriction: function() {
				initialiseTileTypeFriction("addtiletypefriction");
			},
			editTileTypeFriction: function() {
				initialiseTileTypeFriction("edittiletypefriction");
			},
			addTileTypeConveyor: function() {
				initialiseTileTypeConveyor("addtiletypeconveyor");
			},
			editTileTypeConveyor: function() {
				initialiseTileTypeConveyor("edittiletypeconveyor");
			}
		},
		update: {
			backgroundParallaxX: function(value) {
				// If there is no currently loaded map, don't update map data
				if (!Z.editor.map) { return; }
				Z.world.maps[Z.editor.map.id].background.parallax[0] = value;
				Z.editor.map.background = Z.background.create(
					Z.world.maps[Z.editor.map.id].background
				);
				Z.editor.draw();
				
				// Update tooltip
				$("#backgroundparallaxx")
				.data("tooltip", "Parallax: " + Z.editor.map.background.parallax.X)
				.tooltip("update");
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
			},
			backgroundParallaxY: function(value) {
				// If there is no currently loaded map, don't update map data
				if (!Z.editor.map) { return; }
				Z.world.maps[Z.editor.map.id].background.parallax[1] = value;
				Z.editor.map.background = Z.background.create(
					Z.world.maps[Z.editor.map.id].background
				);
				Z.editor.draw();
				
				// Update tooltip
				$("#backgroundparallaxy")
				.data("tooltip", "Parallax: " + Z.editor.map.background.parallax.Y)
				.tooltip("update");
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
			},
			addTileTypeFriction: function(value) {
				updateTileTypeFriction(value, "addtiletypefriction");
			},
			editTileTypeFriction: function(value) {
				updateTileTypeFriction(value, "edittiletypefriction");
			},
			addTileTypeConveyor: function(value) {
				updateTileTypeConveyor(value, "addtiletypeconveyor");
			},
			editTileTypeConveyor: function(value) {
				updateTileTypeConveyor(value, "edittiletypeconveyor");
			}
		}
	};
}());