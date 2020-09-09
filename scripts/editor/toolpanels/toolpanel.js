Z.toolPanel = (function() {
	"use strict";
	
	var _resizing = false,
		_resizeOffset = 0,
		_minWidth = 0;
	
	// Initialise toolpanel when document has loaded
	$(document).ready(function() {
		// Get toolpanel minimum width from CSS
		_minWidth = parseFloat($(".toolpanel").css("min-width"));
		
		// Start resizing from mouse position (plus click offset) when resize control is clicked
		var device = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
		$(".toolpanel .resize")
		.bind("mousedown touchstart", function(e) {
			if (device) {
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				_resizing = true;
			} else {
				_resizing = e.which == 1;
			}
			if (_resizing) {
				$(".toolpanel .resize").addClass("active");
			}
			
			// Get resize button click offset
			var x = device ? touch.clientX : e.clientX;
			_resizeOffset = x - $(".toolpanel .resize").offset().left;
		});
		
		// Resize control as mouse is dragged
		$(document)
		.bind("mousemove touchmove", function(e) {
			if (_resizing) {
				var x = 0;
				if (device) {
					e.preventDefault();
					var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					x = touch.clientX;
				} else {
					x = e.clientX;
				}
				
				// Resize toolpanel
				var width = Math.clamp(
					window.innerWidth - x + _resizeOffset,
					_minWidth,
					window.innerWidth
				);
				$(".toolpanel").width(width);
			}
		})
		.bind("mouseup touchend mouseleave", function(e) {
			// End resizing if mouse button is released or mouse goes outside window
			_resizing = false;
			$(".toolpanel .resize").removeClass("active");
		});
		
		// Initialise back button on selected item toolpanel
		$(".toolpanelcontent.selecteditem .closebutton").click(function() {
			$("div.editor").removeClass("showitemproperties");
		});
	});
}());