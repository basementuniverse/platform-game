Z.tileGrid = (function() {
	"use strict";
	
	var GRID_COLOUR = "rgba(255, 255, 255, 0.2)",
		GRID_WIDTH = 1,
		BOUNDARY_COLOUR = "rgba(0, 255, 255, 0.5)",
		BOUNDARY_WIDTH = 2;
	
	return {
		draw: function(context, width, height) {
			context.save();
			
			// Draw grid lines
			context.strokeStyle = GRID_COLOUR;
			context.lineWidth = GRID_WIDTH;
			var start = vec2.mul(
					vec2.map(vec2.div(Z.camera.bounds, Z.settings.tileSize), Math.floor),
					Z.settings.tileSize
				),
				end = vec2.add(start, vec2(width, height));
			for (var x = start.X; x < end.X; x += Z.settings.tileSize) {	// Vertical
				context.beginPath();
				context.moveTo(x, Z.camera.bounds.Y);
				context.lineTo(x, Z.camera.bounds.Y + height);
				context.stroke();
				context.closePath();
			}
			for (var y = start.Y; y < end.Y; y += Z.settings.tileSize) {	// Horizontal
				context.beginPath();
				context.moveTo(Z.camera.bounds.X, y);
				context.lineTo(Z.camera.bounds.X + width, y);
				context.stroke();
				context.closePath();
			}
			
			// Draw map boundary lines if there is a currently loaded map
			if (Z.editor.map) {
				context.strokeStyle = BOUNDARY_COLOUR;
				context.lineWidth = BOUNDARY_WIDTH;
				var size = vec2.mul(Z.editor.map.size, Z.settings.tileSize);
				context.beginPath();
				context.moveTo(0, 0);
				context.lineTo(size.X, 0);
				context.lineTo(size.X, size.Y);
				context.lineTo(0, size.Y);
				context.closePath();
				context.stroke();
			}
			context.restore();
		}
	};
}());