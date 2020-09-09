Z.toolCursor = (function() {
	"use strict";
	
	var TILE_CURSOR_WIDTH = 2,
		TILE_CURSOR_COLOUR = "rgba(80, 80, 80, 0.7)",
		TILE_CURSOR_BORDER_RADIUS = 2;
	
	var _canvas = null,
		_context = null;
	
	// Draw the currently selected item
	var drawSelectedItem = function(selectedItem, context) {
		context.save();
		
		// Translate context to camera position (scaled)
		var translate = vec2.sub(
			vec2.mul(Z.camera.position, Z.settings.scale),
			vec2.div(Z.camera.size, 2)
		);
		context.setTransform(Z.settings.scale, 0, 0, Z.settings.scale, -translate.X, -translate.Y);
		selectedItem.draw(context);
		
		// If this item can be resized and the resize handles are being hovered over (or if the
		// item is currently being resized), draw the resize handle
		if (selectedItem.itemResize) {
			selectedItem.itemResize.draw(context);
		}
		context.restore();
	};
	
	// Draw the currently hovered item
	var drawHoveredItem = function(hoveredItem, context) {
		context.save();
		
		// Translate context to camera position (scaled)
		var translate = vec2.sub(
			vec2.mul(Z.camera.position, Z.settings.scale),
			vec2.div(Z.camera.size, 2)
		);
		context.setTransform(Z.settings.scale, 0, 0, Z.settings.scale, -translate.X, -translate.Y);
		hoveredItem.draw(context);
		context.restore();
	};
	
	// Draw the tile tool cursor (outline the current hovered tile)
	var drawTileToolCursor = function(context) {
		context.save();
		
		// Translate context to camera position (without scaling)
		var translate = vec2.sub(
			vec2.mul(Z.camera.position, Z.settings.scale),
			vec2.div(Z.camera.size, 2)
		);
		context.setTransform(1, 0, 0, 1, -translate.X, -translate.Y);
		context.lineWidth = TILE_CURSOR_WIDTH;
		context.strokeStyle = TILE_CURSOR_COLOUR;
		Z.utilities.strokeRoundedRectangle(
			context,
			vec2.mul(Z.input.mouseWorldTilePosition, Z.settings.tileSize * Z.settings.scale),
			vec2.mul(vec2(1, 1), Z.settings.tileSize * Z.settings.scale),
			TILE_CURSOR_BORDER_RADIUS
		);
		context.restore();
	};
	
	return {
		hover: false,		// True if the editor canvas is being hovered over
		hoveredItem: null,	// The actor or entity currently being hovered over
		initialise: function() {
			// Get a reference to the tool cursor canvas and create a context
			_canvas = $("canvas#toolcursor").get(0);
			if (_canvas) {
				_context = _canvas.getContext("2d");
			} else {
				console.warn("Couldn't find tool cursor canvas!");
			}
		},
		resize: function(width, height) {
			_canvas.width = width;
			_canvas.height = height;
		},
		draw: function() {
			this.clear();
			
			// If there is a currently selected item in the editor, draw a selection marker
			if (Z.editor.selectedItem && Z.editor.selectedItem.item) {
				drawSelectedItem(Z.editor.selectedItem, _context);
			}
			
			// If there is a hovered item, draw a hover marker
			if (this.hoveredItem) {
				drawHoveredItem(this.hoveredItem, _context);
			}
			
			// If the tile tool is selected, draw the tile tool cursor
			if (this.hover && Z.editor.tool == Z.editorTool.tile) {
				drawTileToolCursor(_context);
			}
		},
		
		// Clear the canvas
		clear: function() {
			_context.clearRect(0, 0, _canvas.width, _canvas.height);
		}
	};
}());