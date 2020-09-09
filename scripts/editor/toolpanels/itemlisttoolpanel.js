Z.itemListToolPanel = (function() {
	"use strict";
	
	var ITEM_BUTTON_SIZE = 32;		// The size of item buttons
	
	// Create and return an item button element for an actor
	var createActorButton = function(actor) {
		var selected = Z.editor.selectedItem ? Z.editor.selectedItem.item.id == actor.id : false,
			button = $("<a class='itembutton' href='javascript:void(0)'>")
				.toggleClass("selected", selected)
				.addClass("actorbutton type_" + actor.baseType)
				.attr("data-id", actor.id)
				.click(function() {
					if (Z.editor.selectedItem && Z.editor.selectedItem.item.id == actor.id) {
						$("div.editor").addClass("showitemproperties");
					} else {
						Z.itemSelection.select(actor);
						Z.camera.moveTo(actor.position);
					}
				})
				.attr("data-tooltip", actor.name + " (" + actor.getTypeName() + ")")
				.tooltip({
					anchorX: 0,
					anchorY: 1,
					originY: -1,
					offsetY: 10,
					className: "tooltip-arrow tooltip-arrow-up"
				});
		
		// Add the actor's sprite image to the button
		var scale = Math.clamp(
				ITEM_BUTTON_SIZE / Math.max(actor.sprite.tileSize.X, actor.sprite.tileSize.Y)
			),
			offset = vec2.mul(
				actor.sprite.animations["idle"].startOffset,
				actor.sprite.tileSize
			),
			image = $("<img>")
			.attr("src", actor.sprite.image.src)
			.css({
				height: Math.floor(actor.sprite.image.height * scale),
				width: Math.floor(actor.sprite.image.width * scale),
				top: -offset.Y * scale,
				left: -offset.X * scale
			}),
			containerSize = vec2(
				Math.floor(actor.sprite.tileSize.X * scale),
				Math.floor(actor.sprite.tileSize.Y * scale)
			),
			imageContainer = $("<div class='imagecontainer'>").css({
				height: containerSize.Y,
				width: containerSize.X,
				top: (ITEM_BUTTON_SIZE / 2) - (containerSize.Y / 2),
				left: (ITEM_BUTTON_SIZE / 2) - (containerSize.X / 2)
			});
		button.append(imageContainer.append(image));
		button.append($("<div class='editindicator'>"));
		return button;
	};
	
	// Create and return an item button element for an entity
	var createEntityButton = function(entity) {
		var selected = Z.editor.selectedItem ? Z.editor.selectedItem.item.id == entity.id : false,
			button = $("<a class='itembutton' href='javascript:void(0)'>")
				.toggleClass("selected", selected)
				.addClass("entitybutton type_" + entity.type)
				.attr("data-id", entity.id)
				.click(function() {
					if (Z.editor.selectedItem && Z.editor.selectedItem.item.id == entity.id) {
						$("div.editor").addClass("showitemproperties");
					} else {
						Z.itemSelection.select(entity);
						Z.camera.moveTo(entity.position);
					}
				})
				.append($("<div class='editindicator'>"))
				.attr("data-tooltip", entity.getTypeName())
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
	var createLightButton = function(light) {
		var selected = Z.editor.selectedItem ? Z.editor.selectedItem.item.id == light.id : false,
			button = $("<a class='itembutton' href='javascript:void(0)'>")
				.toggleClass("selected", selected)
				.addClass("lightbutton type_" + light.type)
				.attr("data-id", light.id)
				.click(function() {
					if (Z.editor.selectedItem && Z.editor.selectedItem.item.id == light.id) {
						$("div.editor").addClass("showitemproperties");
					} else {
						Z.itemSelection.select(light);
						if (light.type != "ambient") {
							Z.camera.moveTo(light.position);
						} else {
							// Re-draw editor after selecting an ambient light so that selection
							// cursor is updated (otherwise previous object will appear to remain
							// selected until the canvas updates)
							Z.editor.draw();
						}
					}
				})
				.append($("<div class='editindicator'>"))
				.attr("data-tooltip", light.getTypeName())
				.tooltip({
					anchorX: 0,
					anchorY: 1,
					originY: -1,
					offsetY: 10,
					className: "tooltip-arrow tooltip-arrow-up"
				});
		return button;
	};
	
	return {
		update: function() {
			// Clear current item buttons
			$(".toolpanelcontent.itemlist .itembuttons .itembutton")
			.tooltip("destroy")
			.remove();
			
			// Make sure there is a map selected
			if (!Z.editor.map) { return; }
			
			// Create actor buttons
			for (var i = 0, length = Z.editor.map.actors.length; i < length; i++) {
				$(".toolpanelcontent.itemlist .itembuttons").append(createActorButton(
					Z.editor.map.actors[i]
				));
			}
			
			// Create entity buttons
			for (var i = 0, length = Z.editor.map.entities.length; i < length; i++) {
				if (Z.editor.map.entities[i].type == "platformwaypoint") { continue; }
				$(".toolpanelcontent.itemlist .itembuttons").append(createEntityButton(
					Z.editor.map.entities[i]
				));
			}
			
			// Create light buttons
			for (var i = 0, length = Z.editor.map.lights.length; i < length; i++) {
				$(".toolpanelcontent.itemlist .itembuttons").append(createLightButton(
					Z.editor.map.lights[i]
				));
			}
			
			// Create a button for adding a new item
			$(".toolpanelcontent.itemlist .itembuttons").append(
				$("<a class='itembutton additembutton' href='javascript:void(0)'>")
				.click(function() {
					Z.dialogs.toggle("itemlibrary", true);
				})
				.attr("data-tooltip", "Add a new item")
				.tooltip({
					anchorX: -1,
					anchorY: 0,
					originX: 1,
					offsetX: -10,
					className: "tooltip-arrow tooltip-arrow-right"
				})
			);
		},
		
		// Update the selection state
		updateSelected: function() {
			// Remove selected state from all buttons
			$(".toolpanelcontent.itemlist .itembuttons .itembutton.selected")
			.removeClass("selected");
			
			// Find the button belonging to the selected item and set it's selected state
			if (Z.editor.selectedItem) {
				var id = Z.editor.selectedItem.item.id;
				$(".toolpanelcontent.itemlist .itembuttons .itembutton[data-id=" + id + "]")
				.addClass("selected");
			}
		}
	};
}());