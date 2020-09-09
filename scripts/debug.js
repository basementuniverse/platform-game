Z.debug = (function() {
	"use strict";
	
	var MARGIN = vec2(10, 10),
		PADDING = vec2(4, 4),
		LINE_HEIGHT = 12,
		FONT = "10pt Lucida Console, monospace",
		TEXT_COLOUR = "white",
		BACKGROUND_COLOUR = "rgba(0, 0, 0, 0.5)",
		MARKER_FONT = "9pt Lucida Console, monospace",
		MARKER_CROSS_SIZE = 6,
		MARKER_CROSS_LINEWIDTH = 2,
		MARKER_LABEL_OFFSET = vec2(12, -6);
	
	var _values = [],
		_markers = [];
	
	// Draw text with a background rectangle
	//	context:	The context on which to draw the text
	//	position:	The position at which to draw the text
	//	text:		The text to draw
	//	font:		The font to use when drawing the text
	//	colour:		The text colour
	var drawText = function(context, position, text, font, colour) {
		context.save();
		context.font = font;
		context.textBaseline = "top";
		
		// Draw background rect
		var backgroundSize = vec2.add(
			vec2(context.measureText(text).width, LINE_HEIGHT),
			vec2.mul(PADDING, 2)
		);
		context.fillStyle = BACKGROUND_COLOUR;
		context.fillRect(
			position.X - PADDING.X,
			position.Y - PADDING.Y,
			backgroundSize.X,
			backgroundSize.Y
		);
		
		// Draw text
		context.fillStyle = colour;
		context.fillText(text, position.X, position.Y);
		context.restore();
	};
	
	// Draw a cross at the specified position
	//	context:	The context on which to draw the cross
	//	position:	The position at which to draw the cross
	//	colour:		The cross colour
	var drawCross = function(context, position, colour) {
		var halfCrossSize = Math.floor(MARKER_CROSS_SIZE / 2);
		context.save();
		context.strokeStyle = colour;
		context.lineWidth = MARKER_CROSS_LINEWIDTH;
		context.translate(position.X, position.Y);
		context.beginPath();
		context.moveTo(-halfCrossSize, -halfCrossSize);
		context.lineTo(halfCrossSize, halfCrossSize);
		context.stroke();
		context.moveTo(-halfCrossSize, halfCrossSize);
		context.lineTo(halfCrossSize, -halfCrossSize);
		context.stroke();
		context.restore();
	};
	
	return {
		// Display a value (with an optional label) in the top left corner of the screen
		//	data: {
		//		value: "",
		//		name: "",
		//		showLabel: true,	(optional)
		//		colour: ""			(optional)
		//	}
		show: function(data) {
			if (data.showLabel === undefined) { data.showLabel = true; }
			_values[data.name] = data;
		},
		
		// Show a value (with an optional marker) at the specified world position
		// 	data: {
		//		position: vec2(),
		//		value: "",			(optional)
		//		name: "",			(optional)
		//		showMarker: true,	(optional)
		//		colour: ""			(optional)
		//	}
		marker: function(data) {
			if (data.value === undefined) { data.value = ""; }
			if (data.showMarker === undefined) { data.showMarker = true; }
			if (data.name) {
				for (var i = _markers.length; i--;) {
					if (_markers[i].name == data.name) {
						_markers[i] = data;
						return;
					}
				}
			}
			_markers.push(data);
		},
		draw: function(context) {
			// Only draw debug text and markers if debug mode is enabled
			if (!Z.settings.debug) { return; }
			context.save();
			
			// Draw text values in corner of screen
			context.save();
			context.setTransform(1, 0, 0, 1, 0, 0);
			var y = MARGIN.Y;
			for (var i in _values) {
				if (!_values.hasOwnProperty(i)) { continue; }
				drawText(
					context,
					vec2(MARGIN.X, y),
					(_values[i].showLabel ? (i + ": ") : "") + _values[i].value,
					FONT,
					_values[i].colour || TEXT_COLOUR
				);
				y += (LINE_HEIGHT + PADDING.Y * 2);
			}
			context.restore();
			
			// Draw marker values in world space
			var p = null;
			for (var i = 0, length = _markers.length; i < length; i++) {
				p = vec2.mul(vec2.sub(_markers[i].position, Z.camera.bounds), Z.settings.scale);
				context.save();
				context.translate(p.X, p.Y);
				if (_markers[i].showMarker) {
					drawCross(
						context,
						vec2(),
						_markers[i].colour || TEXT_COLOUR
					);
				}
				if (_markers[i].value) {
					drawText(
						context,
						vec2(MARKER_LABEL_OFFSET.X, MARKER_LABEL_OFFSET.Y),
						_markers[i].value,
						MARKER_FONT,
						_markers[i].colour || TEXT_COLOUR
					);
				}
				context.restore();
			}
			context.restore();
			
			// Reset values and markers ready for next frame
			_values = [];
			_markers = _markers.filter(function(marker) { return marker.name; });
		}
	};
}());