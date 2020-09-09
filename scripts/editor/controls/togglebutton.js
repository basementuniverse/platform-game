Z.toggleButton = (function() {
	"use strict";
	
	// Initialise all toggle buttons
	$(document).on("finishedloading", function() {
		$(".togglebutton").each(function(k, v) {
			var callback = $(v).attr("data-callback"),
				arg = $(v).attr("data-arg");
			
			// If there is no callback continue to the next button
			if (!callback) { return; }
			
			// Set button's initial state
			$(v).toggleClass("checked", Z.toggleButton.initialise[callback](arg));
			
			// When a toggle button is clicked, call the function specified in data-callback
			// attribute (pass the data-arg attribute as the only argument) and set the toggled
			// state to the return value
			$(v).click(function() {
				if ($(v).hasClass("disabled")) { return; }	// Ignore disabled buttons
				$(v).toggleClass("checked", Z.toggleButton.toggle[callback](arg));
			});
		});
	});
	
	// A collection of initialise and toggle callbacks for each toggle button
	return {
		initialise: {
			showHide: function(option) {
				return Z.editor.show[option];
			},
			worldPrivate: function() {
				$("#worldprivate").text(Z.editor.worldData.private ? "Yes" : "No");
				return Z.editor.worldData.private;
			},
			mapPersistent: function() {
				var result = Z.editor.map ? Z.editor.map.persistent : false;
				$("#mappersistent").text(result ? "Yes" : "No");
				return result;
			},
			backgroundRepeatX: function() {
				var result = Z.editor.map ? Z.editor.map.background.repeatX : false;
				$("#backgroundrepeatx").text(result ? "Yes" : "No");
				return result;
			},
			backgroundRepeatY: function() {
				var result = Z.editor.map ? Z.editor.map.background.repeatY : false;
				$("#backgroundrepeaty").text(result ? "Yes" : "No");
				return result;
			},
			addTileTypeSolid: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].solid;
				
				// If this tile type is solid, disable the edge buttons
				$("#addtiletypetopedge").toggleClass("disabled", result);
				$("#addtiletypebottomedge").toggleClass("disabled", result);
				$("#addtiletypeleftedge").toggleClass("disabled", result);
				$("#addtiletyperightedge").toggleClass("disabled", result);
				return result;
			},
			addTileTypeTopEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
			},
			addTileTypeBottomEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
			},
			addTileTypeRightEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
			},
			addTileTypeLeftEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
			},
			addTileTypeLiquid: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				
				// If this tile type is liquid, enable the breathable button
				$("#addtiletypebreathable").toggleClass("disabled", !result);
				return result;
			},
			addTileTypeLadder: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].ladder;
			},
			addTileTypeDrawFront: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				$("#addtiletypedrawfront").text(result ? "Yes" : "No");
				return result;
			},
			addTileTypeCastShadow: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				$("#addtiletypecastshadow").text(result ? "Yes" : "No");
				return result;
			},
			addTileTypeBreathable: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				$("#addtiletypebreathable").text(result ? "Yes" : "No");
				return result;
			},
			editTileTypeSolid: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].solid;
				
				// If this tile type is solid, disable the edge buttons
				$("#edittiletypetopedge").toggleClass("disabled", result);
				$("#edittiletypebottomedge").toggleClass("disabled", result);
				$("#edittiletypeleftedge").toggleClass("disabled", result);
				$("#edittiletyperightedge").toggleClass("disabled", result);
				return result;
			},
			editTileTypeTopEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
			},
			editTileTypeBottomEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
			},
			editTileTypeRightEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
			},
			editTileTypeLeftEdge: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
			},
			editTileTypeLiquid: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				
				// If this tile type is liquid, enable the breathable button
				$("#edittiletypebreathable").toggleClass("disabled", !result);
				return result;
			},
			editTileTypeLadder: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				return Z.world.tileTypes[Z.editor.selectedTileType].ladder;
			},
			editTileTypeDrawFront: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				$("#edittiletypedrawfront").text(result ? "Yes" : "No");
				return result;
			},
			editTileTypeCastShadow: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				$("#edittiletypecastshadow").text(result ? "Yes" : "No");
				return result;
			},
			editTileTypeBreathable: function() {
				if (
					!Z.editor.selectedTileType ||
					!Z.world.tileTypes[Z.editor.selectedTileType]
				) { return; }
				var result = Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				$("#edittiletypebreathable").text(result ? "Yes" : "No");
				return result;
			}
		},
		toggle: {
			showHide: function(option) {
				Z.editor.show[option] = !Z.editor.show[option];
				Z.editor.draw();
				return Z.editor.show[option];
			},
			worldPrivate: function() {
				Z.editor.worldData.private = !Z.editor.worldData.private;
				$("#worldprivate").text(Z.editor.worldData.private ? "Yes" : "No");
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return Z.editor.worldData.private;
			},
			mapPersistent: function() {
				var result = false;
				if (Z.editor.map) {
					Z.editor.map.persistent = !Z.editor.map.persistent;
					result = Z.editor.map.persistent;
					Z.world.maps[Z.editor.map.id].persistent = result;
				}
				$("#mappersistent").text(result ? "Yes" : "No");
				
				// Notify the editor that changes have been made to map data
				Z.toolbar.setDirty(true);
				return result;
			},
			backgroundRepeatX: function() {
				var result = false;
				if (Z.editor.map) {
					Z.editor.map.background.repeatX = !Z.editor.map.background.repeatX;
					result = Z.editor.map.background.repeatX;
					Z.world.maps[Z.editor.map.id].background.repeatX = result;
					
					// Rebuild the map's background instance and redraw the editor canvas
					Z.editor.map.background = Z.background.create(
						Z.world.maps[Z.editor.map.id].background
					);
					Z.editor.draw();
				}
				$("#backgroundrepeatx").text(result ? "Yes" : "No");
				
				// Notify the editor that changes have been made to map data
				Z.toolbar.setDirty(true);
				return result;
			},
			backgroundRepeatY: function() {
				var result = false;
				if (Z.editor.map) {
					Z.editor.map.background.repeatY = !Z.editor.map.background.repeatY;
					result = Z.editor.map.background.repeatY;
					Z.world.maps[Z.editor.map.id].background.repeatY = result;
					
					// Rebuild the map's background instance and redraw the editor canvas
					Z.editor.map.background = Z.background.create(
						Z.world.maps[Z.editor.map.id].background
					);
					Z.editor.draw();
				}
				$("#backgroundrepeaty").text(result ? "Yes" : "No");
				
				// Notify the editor that changes have been made to map data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeSolid: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].solid =
					!Z.world.tileTypes[Z.editor.selectedTileType].solid;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].solid;
				
				// If this tile type is solid, disable the edge buttons
				$("#addtiletypetopedge").toggleClass("disabled", result);
				$("#addtiletypebottomedge").toggleClass("disabled", result);
				$("#addtiletypeleftedge").toggleClass("disabled", result);
				$("#addtiletyperightedge").toggleClass("disabled", result);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeTopEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].topEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeBottomEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeRightEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].rightEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeLeftEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].leftEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeLiquid: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].liquid =
					!Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				
				// If this tile type is liquid, enable the breathable button
				$("#addtiletypebreathable").toggleClass("disabled", !result);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeLadder: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].ladder =
					!Z.world.tileTypes[Z.editor.selectedTileType].ladder;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].ladder;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeDrawFront: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].drawFront =
					!Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				$("#addtiletypedrawfront").text(result ? "Yes" : "No");
				
				// Rebuild the current loaded map if there is one and redraw the editor canvas
				Z.editor.changeMap(null, false);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeCastShadow: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].castShadow =
					!Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				$("#addtiletypecastshadow").text(result ? "Yes" : "No");
				
				// Rebuild the current loaded map if there is one and redraw the editor canvas
				Z.editor.changeMap(null, false);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			addTileTypeBreathable: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].breathable =
					!Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				$("#addtiletypebreathable").text(result ? "Yes" : "No");
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeSolid: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].solid =
					!Z.world.tileTypes[Z.editor.selectedTileType].solid;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].solid;
				
				// If this tile type is solid, disable the edge buttons
				$("#edittiletypetopedge").toggleClass("disabled", result);
				$("#edittiletypebottomedge").toggleClass("disabled", result);
				$("#edittiletypeleftedge").toggleClass("disabled", result);
				$("#edittiletyperightedge").toggleClass("disabled", result);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeTopEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].topEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].topEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeBottomEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].bottomEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeRightEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].rightEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].rightEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeLeftEdge: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].leftEdge =
					!Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].leftEdge;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeLiquid: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].liquid =
					!Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].liquid;
				
				// If this tile type is liquid, enable the breathable button
				$("#edittiletypebreathable").toggleClass("disabled", !result);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeLadder: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].ladder =
					!Z.world.tileTypes[Z.editor.selectedTileType].ladder;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].ladder;
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeDrawFront: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].drawFront =
					!Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].drawFront;
				$("#edittiletypedrawfront").text(result ? "Yes" : "No");
				
				// Rebuild the current loaded map if there is one and redraw the editor canvas
				Z.editor.changeMap(null, false);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeCastShadow: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].castShadow =
					!Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].castShadow;
				$("#edittiletypecastshadow").text(result ? "Yes" : "No");
				
				// Rebuild the current loaded map if there is one and redraw the editor canvas
				Z.editor.changeMap(null, false);
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			},
			editTileTypeBreathable: function() {
				Z.world.tileTypes[Z.editor.selectedTileType].breathable =
					!Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				var result = Z.world.tileTypes[Z.editor.selectedTileType].breathable;
				$("#edittiletypebreathable").text(result ? "Yes" : "No");
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
				return result;
			}
		}
	};
}());