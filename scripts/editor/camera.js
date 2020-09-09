Z.camera = (function() {
	"use strict";
	
	var PAN_SPEED = 50,			// The speed (in pixels per second) to use when panning the camera
		LOOP_RATE = 60,			// The loop rate (iterations per second) for moving the camera
		EASE_AMOUNT = 0.05;		// The ease amount to use when repositioning the camera via the
								// status bar buttons (player/origin button and coordinate inputs)
	
	var _dragging = false,
		_dragStartOffset = vec2(),
		_moveVector = vec2(),	// The current move vector for panning the camera with the keyboard
		_moveTarget = vec2(),	// The current target position to ease the camera towards
		_panLoop = null,		// A handle to the keyboard panning loop
		_moveLoop = null;		// A handle to the move easing loop
	
	return {
		position: vec2(),
		size: vec2(),
		bounds: vec2(),		
		
		// Initialises the camera position
		//	position:		The camera's initial position
		initialise: function(position) {
			this.position = position;
		},
		
		// Move the camera gradually to the specified position
		moveTo: function(position) {
			// Cancel any existing move loop
			clearTimeout(_moveLoop);
			_moveLoop = null;
			
			// Set target position
			_moveTarget = position;
			
			// Start a new move loop
			_moveLoop = setInterval(function() {
				var delta = vec2.sub(_moveTarget, Z.camera.position);
				
				// If the camera has reached the target position (within 1 pixel), stop the loop
				if (vec2.len(delta) < 1) {
					Z.camera.position = _moveTarget;
					clearTimeout(_moveLoop);
					_moveLoop = null;
				} else {
					Z.camera.position = vec2.add(Z.camera.position, vec2.mul(delta, EASE_AMOUNT));
				}
				
				// Re-draw the editor canvas
				Z.editor.draw();
			}, 1000 / LOOP_RATE);
		},
		
		// Handle mouse input for dragging the camera when the move camera tool
		handleMouseInput: function(down, clicked) {
			if (clicked) {
				_dragStartOffset = vec2(Z.input.mouseWorldPosition);
				_dragging = true;
				$("canvas#editor").addClass("dragging");
			}
			if (down) {
				var delta = vec2.sub(_dragStartOffset, Z.input.mouseWorldPosition);
				this.position = vec2.add(this.position, delta);
				
				// When moving the camera with the mouse, cancel the move loop (if it is running)
				clearTimeout(_moveLoop);
				_moveLoop = null;
			} else if (_dragging) {	// Remove dragging state when mouse button is released
				_dragging = false;
				$("canvas#editor").removeClass("dragging");
			}
		},
		
		// Handle keyboard input for panning the camera with the arrow keys
		handleKeyboardInput: function(key, down) {
			var moving = false;
			if (Z.editor.tool == Z.editorTool.move) {
				var speed = PAN_SPEED / (1000 / LOOP_RATE);
				if (Z.input.checkControl(key, "up")) {
					_moveVector.Y = down ? -speed : 0;
					moving = down;
				} else if (Z.input.checkControl(key, "down")) {
					_moveVector.Y = down ? speed : 0;
					moving = down;
				}
				if (Z.input.checkControl(key, "left")) {
					_moveVector.X = down ? -speed : 0;
					moving = down;
				} else if (Z.input.checkControl(key, "right")) {
					_moveVector.X = down ? speed : 0;
					moving = down;
				}
			} else {
				_moveVector = vec2();
			}
			
			if (moving) {
				// If an arrow key was pressed and there isn't a panning loop already running,
				// start the panning loop
				if (!_panLoop) {
					_panLoop = setInterval(function() {
						Z.camera.position = vec2.add(Z.camera.position, _moveVector);
						Z.editor.draw();
					}, 1000 / LOOP_RATE);
				}
				
				// Cancel the move loop (if it is running)
				clearTimeout(_moveLoop);
				_moveLoop = null;
			}
			
			// Cancel the panning loop if there is no move vector
			if (!_moveVector.X && !_moveVector.Y) {
				clearTimeout(_panLoop);
				_panLoop = null;
			}
		},
		
		// Update the camera position transform
		update: function(context, width, height) {
			// Clamp camera position to map size (plus a buffer area the same size as the screen)
			if (Z.editor.map) {
				var scaledWidth = width / Z.settings.scale,
					scaledHeight = height / Z.settings.scale;
				this.position.X = Math.clamp(
					this.position.X,
					-scaledWidth,
					(Z.editor.map.size.X * Z.settings.tileSize) + scaledWidth
				);
				this.position.Y = Math.clamp(
					this.position.Y,
					-scaledHeight,
					(Z.editor.map.size.Y * Z.settings.tileSize) + scaledHeight
				);
			}
			
			// Get the screen size and camera bounds in world coords
			this.size = vec2(width, height);
			this.bounds = vec2.sub(
				this.position,
				vec2.div(this.size, 2 * Z.settings.scale)
			);
			
			// Translate context to camera position and set scale
			var translate = vec2.map(
				vec2.add(vec2.mul(this.position, -Z.settings.scale), vec2.div(this.size, 2)),
				Math.floor
			);
			context.setTransform(
				Z.settings.scale,
				0, 0,
				Z.settings.scale,
				translate.X, translate.Y
			);
			
			// Update the camera position form values
			Z.statusBar.updateCameraPosition();
		}
	};
}());