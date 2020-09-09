Z.main = (function() {
	"use strict";
	
	var FRAME_TIME = 1 / 60;	// Fixed timestep
	
	var _canvas = null,
		_context = null,
		_loop = null,
		_frameRate = 0,
		_frameCount = 0,
		_lastFrameTime = 0;
	
	// Calculate actual framerate
	var calculateFramerate = function() {
		var frameTime = (new Date()).getTime();
		if (frameTime - _lastFrameTime >= 1000) {
			_lastFrameTime = frameTime;
			_frameRate = _frameCount;
			_frameCount = 0;
		}
		_frameCount++;
	};
	
	// Initialise and start game (called by content loader)
	var start = function(content) {
		Z.main.loop();
		Z.stateManager.push(Z.settings.showIntro ? Z.intro : Z.mainMenu);
	};
	
	return {
		initialise: function(id) {
			_canvas = $("<canvas id='main'>").appendTo("div.game").get(0);
			if (_canvas && _canvas.getContext) {
				_context = _canvas.getContext("2d");
				
				// Handle window resize
				$(window).resize(function() {
					_canvas.width = window.innerWidth;
					_canvas.height = window.innerHeight;
					
					// Disable image smoothing for pixelated graphics
					_context.imageSmoothingEnabled = false;
					_context.webkitImageSmoothingEnabled = false;
					_context.mozImageSmoothingEnabled = false;
				}).trigger("resize");
				
				// Disable lighting if multiply and screen globalCompositeOperation modes aren't
				// supported in the current browser
				var lightingSupport = true;
				_context.globalCompositeOperation = "multiply";
				if (_context.globalCompositeOperation != "multiply") { lightingSupport = false; }
				_context.globalCompositeOperation = "screen";
				if (_context.globalCompositeOperation != "screen") { lightingSupport = false; }
				if (!lightingSupport) {
					console.warn("Required composite modes not supported. Lighting disabled.");
					Z.settings.lightingEnabled = false;
				}
				
				// Initialise lightmap canvas
				Z.lightMap.initialiseCanvas();
				
				// Get a list of content assets from the server and start loading them
				Z.utilities.loading(true);
				$.ajax({
					dataType: "json",
					url: Z.settings.contentPath + (id || Z.settings.defaultWorld),
					success: function(data) {
						var contentItems = [];
						for (var i = data.items.length; i--;) {
							contentItems.push({
								id: data.items[i].id,
								loader: Z.content.loaders[data.items[i].loader],
								args: data.items[i].args
							});
						}
						Z.content.load(contentItems, start);
					},
					error: function(request, status, error) {
						if (Z.settings.debug) {
							console.error(
								"Error loading main content list (%s): %O, %O",
								status, request, error
							);
						}
					}
				});
			} else {
				console.warn("Browser not supported!");
			}
		},
		loop: function() {
			Z.main.update();
			Z.main.draw();
			_loop = window.requestAnimationFrame(Z.main.loop);
		},
		update: function() {
			Z.stateManager.update(FRAME_TIME);
			Z.input.update();
			
			// Calculate and display framerate if debug and showFPS is enabled
			calculateFramerate();
			if (Z.settings.showFPS) {
				Z.debug.show({ value: _frameRate, name: "FPS" });
			}
		},
		draw: function() {
			_context.clearRect(0, 0, _canvas.width, _canvas.height);
			Z.stateManager.draw(_context, _canvas.width, _canvas.height);
			Z.debug.draw(_context);
		}
	};
}());