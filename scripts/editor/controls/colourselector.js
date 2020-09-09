Z.colourSelector = (function() {
	"use strict";
	
	var SLIDER_WIDTH = 100,		// Width of each colour slider control
		UPDATE_DELAY = 250,		// Number of ms before update is called when the slider is changed
		ALPHA_PRECISION = 100;	// Alpha channel value precision will be (1 / PRECISION)
	
	// Initialise a colour slider control
	//	selector:	The colour selector element
	//	slider:		The slider container element
	//	callback:	The callback id for this selector
	var initialiseSlider = function(selector, slider, callback) {
		var drag = false,
			timeout = null,
			bar = $("<div class='bar'>").appendTo(slider),
			update = function(e) {
				var offset = bar.offset();
				
				// Set bar width
				bar.width(Math.clamp(e.clientX - offset.left, 0, SLIDER_WIDTH));
				
				// Calculate colour
				var red = selector.find(".colourslider.red .bar").width(),
					green = selector.find(".colourslider.green .bar").width(),
					blue = selector.find(".colourslider.blue .bar").width(),
					alpha = selector.find(".colourslider.alpha .bar").width(),
					colour = null;
				red = Math.round(Math.clamp(red / SLIDER_WIDTH) * 255);
				green = Math.round(Math.clamp(green / SLIDER_WIDTH) * 255);
				blue = Math.round(Math.clamp(blue / SLIDER_WIDTH) * 255);
				alpha = Math.round(
					Math.clamp(alpha / SLIDER_WIDTH) * ALPHA_PRECISION
				) / ALPHA_PRECISION;
				colour = "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
				
				// Update colour preview elements
				selector.find(".colourpreviewinner").css("background-color", colour);
				
				// Update current colour text
				selector.find("a.currentvalue .currentvaluetext").text(colour);
				
				// Update value after the bar has been unchanged for some amount of time
				clearTimeout(timeout);
				timeout = setTimeout(function() {
					Z.colourSelector.update[callback](colour);
				}, UPDATE_DELAY);
			};
		
		// Add mouse events handlers
		slider
		.mousedown(function(e) {
			drag = true;
			update(e);
		})
		.mouseup(function() { drag = false; })
		.mouseout(function() { drag = false; })
		.mousemove(function(e) {
			if (drag) {
				update(e);
			}
		});
	};
	
	// Initialise colour selector elements
	$(document).ready(function() {
		$(".dropdown.colourselector").each(function(k, v) {
			var selector = $(v),
				callback = selector.attr("data-callback");
			
			// If there is no callback continue to the next control
			if (!callback) { return; }
			
			// Initialise colour sliders
			initialiseSlider(selector, selector.find(".colourslider.red"), callback);
			initialiseSlider(selector, selector.find(".colourslider.green"), callback);
			initialiseSlider(selector, selector.find(".colourslider.blue"), callback);
			initialiseSlider(selector, selector.find(".colourslider.alpha"), callback);
		});
	});
	
	return {
		initialise: {
			// Map background colour must be a string like "rgba(R, G, B, A)"
			backgroundColour: function() {
				// If there is no currently loaded map, don't initialise this selector
				if (!Z.editor.map) { return; }
				var colours = Z.editor.map.background.colour.slice(5).split(","),
					r = (parseFloat(colours[0]) / 255) * SLIDER_WIDTH,
					g = (parseFloat(colours[1]) / 255) * SLIDER_WIDTH,
					b = (parseFloat(colours[2]) / 255) * SLIDER_WIDTH,
					a = parseFloat(colours[3]) * SLIDER_WIDTH;
				$("#backgroundcolourselector .colourslider.red .bar").width(r);
				$("#backgroundcolourselector .colourslider.green .bar").width(g);
				$("#backgroundcolourselector .colourslider.blue .bar").width(b);
				$("#backgroundcolourselector .colourslider.alpha .bar").width(a);
				
				// Set colour preview elements background colour
				$("#backgroundcolourselector .colourpreviewinner").css(
					"background-color",
					Z.editor.map.background.colour
				);
				
				// Set current value text
				$("#backgroundcolourselector a.currentvalue  .currentvaluetext").text(
					Z.editor.map.background.colour
				);
			}
		},
		update: {
			backgroundColour: function(colour) {
				// If there is no currently loaded map, don't update map data
				if (!Z.editor.map) { return; }
				Z.world.maps[Z.editor.map.id].background.colour = colour;
				Z.editor.map.background.colour = colour;
				Z.editor.draw();
				
				// Notify the editor that changes have been made to world data
				Z.toolbar.setDirty(true);
			}
		}
	};
}());