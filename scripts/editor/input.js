Z.input = (function() {
	"use strict";
	
	var _keyboardState = [],
		_mouseDown = false,
		_input = {
			canvasOffset: vec2(),			// Canvas position from top left corner of window
			mousePosition: vec2(),			// Mouse position relative to window
			mouseWorldPosition: vec2(),		// Mouse position in world (in pixels)
			mouseWorldTilePosition: vec2(),	// Mouse position in world (in tiles)
			ctrlDown: false,				// True if CTRL key is currently down (used for some
											// keyboard shortcuts)
			inputFocus: false,				// True if any input elements currently have focus
			initialise: function(offset) {
				this.canvasOffset = offset;
			},
			
			// Check if the specified key matches the primary or alternative control for the
			// specified action
			//	key:		The key to check
			//	action:		The action to check
			checkControl: function(key, action) {
				var controls = Z.content.items["controls"].editor;
				return (key == controls[action][0] || key == controls[action][1]);
			}
		};
	
	// Update mouse position in window and world
	var updateMousePosition = function(x, y) {
		_input.mousePosition.X = x;
		_input.mousePosition.Y = y;
		_input.mouseWorldPosition = vec2.sub(
			vec2.add(vec2.div(_input.mousePosition, Z.settings.scale), Z.camera.bounds),
			vec2.div(_input.canvasOffset, Z.settings.scale)
		);
		_input.mouseWorldTilePosition = vec2.map(
			vec2.div(_input.mouseWorldPosition, Z.settings.tileSize),
			Math.floor
		);
	};
	
	$(document).ready(function() {
		// Handle keyboard events
		$(document)
		.keydown(function(e) {
			if (
				!_input.inputFocus && (
					e.metaKey || e.altKey || e.ctrlKey ||
					e.keyCode == Keys.Up || e.keyCode == Keys.Down ||
					e.keyCode == Keys.Left || e.keyCode == Keys.Right
				)
			) {
				e.preventDefault();
			}
			if (e.keyCode == Keys.Ctrl) { _input.ctrlDown = true; }		// Track CTRL key state
			if (!_keyboardState[e.keyCode]) {
				Z.editor.handleKeyboardInput(e.keyCode, true);
			}
			_keyboardState[e.keyCode] = true;
		})
		.keyup(function(e) {
			if (e.metaKey || e.altKey || e.ctrlKey) {
				e.preventDefault();
			}
			if (e.keyCode == Keys.Ctrl) { _input.ctrlDown = false; }	// Track CTRL key state
			_keyboardState[e.keyCode] = false;
			Z.editor.handleKeyboardInput(e.keyCode, false);
		});
		
		// Handle mouse/touch events
		var device = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
		$("canvas#editor")
		.bind("mousedown touchstart", function(e) {
			if (device) {
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				updateMousePosition(touch.clientX, touch.clientY);
				_mouseDown = true;
			} else {
				updateMousePosition(e.clientX, e.clientY);
				_mouseDown = e.which == 1;
			}
			Z.editor.handleMouseInput(_mouseDown, true);
		})
		.bind("mouseup touchend", function(e) {
			_mouseDown = false;
			Z.editor.handleMouseInput(_mouseDown, false);
		})
		.bind("mouseover mouseenter", function(e) {
			Z.toolCursor.hover = true;
		})
		.bind("mouseout mouseleave", function(e) {
			_mouseDown = false;
			Z.editor.handleMouseInput(_mouseDown, false);
			Z.toolCursor.hover = false;
		})
		.bind("mousemove touchmove", function(e) {
			if (device) {
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				updateMousePosition(touch.clientX, touch.clientY);
			} else {
				updateMousePosition(e.clientX, e.clientY);
			}
			Z.editor.handleMouseInput(_mouseDown, false);
		});
		
		// Notify the tool cursor canvas when the mouse pointer leaves the window
		$(window).mouseleave(function() { Z.toolCursor.hover = false; });
		
		// Keep track of any input elements (inputs or textareas) that acquire focus
		$(document)
		.on("focus", "input, textarea", function() { _input.inputFocus = true; })
		.on("blur", "input, textarea", function() { _input.inputFocus = false; });
	});
	
	return _input;
}());