Z.statusBar = (function() {
	"use strict";
	
	var _message = "";
	
	return {
		// Initialise status bar button click handlers
		initialise: function() {
			// Initialise origin button
			$(".button.originbutton").click(function() {
				Z.camera.moveTo(Z.editor.map ? Z.editor.map.playerStartingPosition : vec2());
				
				// Redraw the editor using the new camera position
				Z.editor.draw();
			});
			
			// Initialise set camera position buttons
			$("#statustext").click(function() {
				Z.statusBar.showCameraPositionForm(true);
			});
			$(".cameraposition .setcamerapositionbutton").click(function() {
				var cameraPosition = vec2(
					parseInt($(".cameraposition input#cameraposition_x").val()),
					parseInt($(".cameraposition input#cameraposition_y").val())
				);
				Z.camera.moveTo(cameraPosition);
				
				// Redraw the editor using the new camera position
				Z.editor.draw();
				
				// Hide the camera position form
				Z.statusBar.showCameraPositionForm(false);
			});
			$(".cameraposition .cancelsetcamerapositionbutton").click(function() {
				Z.statusBar.showCameraPositionForm(false);
			});
			
			// When a camera position form input is changed, update the other inputs accordingly
			$(".cameraposition input#cameraposition_x").blur(function() {
				var tilePosition = Math.floor(parseInt($(this).val()) / Z.settings.tileSize);
				$(".cameraposition input#cameraposition_tilex").val(tilePosition);
			});
			$(".cameraposition input#cameraposition_y").blur(function() {
				var tilePosition = Math.floor(parseInt($(this).val()) / Z.settings.tileSize);
				$(".cameraposition input#cameraposition_tiley").val(tilePosition);
			});
			$(".cameraposition input#cameraposition_tilex").blur(function() {
				var position = Math.floor(parseInt($(this).val()) * Z.settings.tileSize);
				$(".cameraposition input#cameraposition_x").val(position);
			});
			$(".cameraposition input#cameraposition_tiley").blur(function() {
				var position = Math.floor(parseInt($(this).val()) * Z.settings.tileSize);
				$(".cameraposition input#cameraposition_y").val(position);
			});
			
			// Initially show a blank message
			this.updateMessage("");
		},
		
		// Update the status bar text with current mouse positions
		updateMessage: function(message) {
			if (message !== undefined) {
				_message = message;
			}
			
			// Update mouse world/tile position and message
			$("#statustext").text(
				Math.round(Z.input.mouseWorldPosition.X) + ", " +
				Math.round(Z.input.mouseWorldPosition.Y) + " (Tile: " +
				Z.input.mouseWorldTilePosition.X + ", " +
				Z.input.mouseWorldTilePosition.Y + ")" +
				(_message ? " | " + _message : "")
			);
		},
		
		// Update the camera position form values
		updateCameraPosition: function() {
			$(".cameraposition input#cameraposition_x").val(Math.round(Z.camera.position.X));
			$(".cameraposition input#cameraposition_y").val(Math.round(Z.camera.position.Y));
			$(".cameraposition input#cameraposition_tilex").val(
				Math.floor(Z.camera.position.X / Z.settings.tileSize)
			);
			$(".cameraposition input#cameraposition_tiley").val(
				Math.floor(Z.camera.position.Y / Z.settings.tileSize)
			);
		},
		
		// Show or hide the set camera position form
		showCameraPositionForm: function(show) {
			if (show) {
				// Hide status text and display camera position form
				$("#statustext").fadeOut();
				$(".cameraposition").fadeIn();
			} else {
				// Hide camera position form and display status text
				$(".cameraposition").fadeOut();
				$("#statustext").fadeIn();
			}
		}
	};
}());