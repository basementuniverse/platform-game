Z.lightMap = (function() {
	"use strict";
	
	var _context = null,
		_editorElement = null,
		_toolbarHeight = 0,
		_statusbarHeight = 0;
	
	return {
		canvas: null,
		initialiseCanvas: function(editorElement, toolbarHeight, statusbarHeight) {
			this.canvas = document.createElement("canvas");
			_context = this.canvas.getContext("2d");
			
			// If the editor is active, store a reference to the editor container div and the
			// calculated height of toolbar and statusbar elements
			if (editorElement) {
				_editorElement = editorElement;
				_toolbarHeight = toolbarHeight;
				_statusbarHeight = statusbarHeight;
			}
			
			// Handle window resize
			$(window).resize(function() {
				var width = 0, height = 0;
				if (_editorElement) {
					width = _editorElement.width();
					height = _editorElement.height() - (_toolbarHeight + _statusbarHeight);
				} else {
					width = window.innerWidth;
					height = window.innerHeight;
				}
				Z.lightMap.canvas.width = width;
				Z.lightMap.canvas.height = height;
				
				// Disable image smoothing for pixelated graphics
				_context.imageSmoothingEnabled = false;
				_context.webkitImageSmoothingEnabled = false;
				_context.mozImageSmoothingEnabled = false;
				
				// Redraw editor canvas if using the editor
				if (_editorElement) {
					Z.editor.draw();
				}
			}).trigger("resize");
		},
		update: function(elapsedTime, lights) {
			if (!Z.settings.lightingEnabled) { return; }
			for (var i = lights.length; i--;) {
				lights[i].update(elapsedTime);
			}
		},
		draw: function(gameContext, lights) {
			if (!Z.settings.lightingEnabled) { return; }
			
			// Fill lightmap with black
			_context.save();
			_context.fillStyle = "black";
			_context.fillRect(0, 0, Z.camera.size.X, Z.camera.size.Y);
			_context.restore();
			
			// Draw lights
			_context.save();
			_context.translate(-Z.camera.bounds.X, -Z.camera.bounds.Y);
			for (var i = lights.length; i--;) {
				lights[i].draw(_context);
			}
			_context.restore();
			
			// Draw lightmap overlaid on game canvas
			gameContext.save();
			gameContext.globalCompositeOperation = "multiply";
			gameContext.drawImage(this.canvas, Z.camera.bounds.X, Z.camera.bounds.Y);
			gameContext.restore();
		}
	};
}());