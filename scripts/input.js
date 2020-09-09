Z.input = (function() {
	"use strict";
	
	var _keyboardState = [],
		_previousKeyboardState = [],
		_mouseState = [],
		_previousMouseState = [],
		_mouseWheel = 0,				// Set mouse wheel state next frame
		_input = {
			mousePosition: vec2(),		// Mouse position relative to window
			mouseWorldPosition: vec2(),	// Mouse position in world
			mouseWheel: 0,				// Mouse wheel state (-1 is up, 1 is down, 0 is not moved)
			
			// Return true if the specified key is currently pressed. If key is undefined, check if
			// any key is currently pressed and return the first key code found, or false if none
			// are currently pressed
			keyDown: function(key) {
				if (key === undefined) {
					for (var k in _keyboardState) {
						if (!_keyboardState.hasOwnProperty(k)) { continue; }
						if (_keyboardState[k]) { return _keyboardState[k]; }
					}
					return false;
				}
				return _keyboardState[key];
			},
			
			// Return true if the specified key was pressed since the last frame. If key is
			// undefined, check if any key was pressed since the last frame and return the first
			// key code found
			keyPressed: function(key) {
				if (key === undefined) {
					for (var k in _keyboardState) {
						if (!_keyboardState.hasOwnProperty(k)) { continue; }
						if (_keyboardState[k] && !_previousKeyboardState[k]) {
							return _keyboardState[k];
						}
					}
					return false;
				}
				return (_keyboardState[key] && !_previousKeyboardState[key]);
			},
			
			// Return true if a mouse button is pressed
			mouseDown: function(button) {
				return _mouseState[button || Mouse.Left];
			},
			
			// Return true if a mouse button was clicked since the last frame
			mouseClicked: function(button) {
				return (
					_mouseState[button || Mouse.Left] &&
					!_previousMouseState[button || Mouse.Left]
				);
			},
			
			// Update input manager - must be called last during update phase (since it will clear
			// all input ready for checking on the next frame)
			update: function() {
				_previousKeyboardState = [];
				for (var i in _keyboardState) { _previousKeyboardState[i] = _keyboardState[i]; }
				_previousMouseState = [];
				for (var i in _mouseState) { _previousMouseState[i] = _mouseState[i]; }
				
				// Set mouse world position (scaled)
				this.mouseWorldPosition = vec2.div(
					vec2.add(Z.camera.bounds, this.mousePosition),
					Z.settings.scale
				);
				
				// Update mouse wheel state
				this.mouseWheel = _mouseWheel;
				_mouseWheel = 0;
			}
		};
	
	// Handle keyboard events
	$(document)
	.keydown(function(e) {
		if (e.metaKey || e.altKey) { return; }
		_keyboardState[e.keyCode] = true;
		if (e.keyCode == Keys.Up || e.keyCode == Keys.Down ||
			e.keyCode == Keys.Left || e.keyCode == Keys.Right) {
			e.preventDefault();
		}
	})
	.keyup(function(e) {
		if (e.metaKey || e.altKey) { return; }
		_keyboardState[e.keyCode] = false;
	});
	
	// Handle mouse/touch events
	var device = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
	$(document)
	.bind("mousedown touchstart", function(e) {
		if (device) {
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			_input.mousePosition.X = touch.clientX;
			_input.mousePosition.Y = touch.clientY;
			_mouseState[Mouse.Left] = true;
		} else {
			_input.mousePosition.X = e.clientX;
			_input.mousePosition.Y = e.clientY;
			_mouseState[e.which] = true;
		}
	})
	.bind("mouseup touchend", function(e) {
		_mouseState[device ? Mouse.Left : e.which] = false;
	})
	.bind("mousemove touchmove", function(e) {
		if (device) {
			e.preventDefault();
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			_input.mousePosition.X = touch.clientX;
			_input.mousePosition.Y = touch.clientY;
		} else {
			_input.mousePosition.X = e.clientX;
			_input.mousePosition.Y = e.clientY;
		}
	})
	.bind("mousewheel DOMMouseScroll", function(e) {
		_mouseWheel = (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0) ? 1 : -1;
	});
	
	return _input;
}());