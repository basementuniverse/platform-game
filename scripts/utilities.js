Z.utilities = (function() {
	"use strict";
	
	var ARROW_HEIGHT = 4,
		ARROW_WIDTH = 5,
		CURVE_AMOUNT = 3;	// Arrow curves will be 1 / CURVE_AMOUNT of the arrow line's length
	
	// Draw a rounded rectangle path on the specified canvas
	var drawRoundedRectanglePath = function(context, position, size, radius) {
		context.beginPath();
		
		// Top edge
		context.moveTo(position.X + radius, position.Y);
		context.lineTo(position.X + size.X - radius, position.Y);
		context.quadraticCurveTo(	// Top right corner
			position.X + size.X,
			position.Y,
			position.X + size.X,
			position.Y + radius
		);
		
		// Right edge
		context.lineTo(position.X + size.X, position.Y + size.Y - radius);
		context.quadraticCurveTo(	// Bottom right corner
			position.X + size.X,
			position.Y + size.Y,
			position.X + size.X - radius,
			position.Y + size.Y
		);
		
		// Bottom edge
		context.lineTo(position.X + radius, position.Y + size.Y);
		context.quadraticCurveTo(	// Bottom left corner
			position.X,
			position.Y + size.Y,
			position.X,
			position.Y + size.Y - radius
		);
		
		// Left edge
		context.lineTo(position.X, position.Y + radius);
		context.quadraticCurveTo(	// Top left corner
			position.X,
			position.Y,
			position.X + radius,
			position.Y
		);
		context.closePath();
	};
	
	// Round the direction of the specified vector into 4 directions
	var roundDirection4 = function(direction) {
		if (Math.abs(direction.X) > Math.abs(direction.Y)) {
			return vec2(direction.X > 0 ? 1 : -1, 0);
		}
		return vec2(0, direction.Y > 0 ? 1 : -1);
	};
	
	// Round the direction of the specified vector into 8 directions
	var roundDirection8 = function(direction) {
		return vec2.norm(vec2.map(vec2.norm(direction), function(n) {
			if (n < -0.5) { return -1; }
			if (n >= 0.5) { return 1; }
			return 0;
		}));
	};
	
	// Split a word's characters into multiple words if it is longer than the specified width
	var splitWord = function(context, word, width) {
		var chars = word.split(""),
			charWidth = 0,
			wordWidth = 0,
			words = [],
			currentWord = "";
		for (var i = 0, length = chars.length; i < length; i++) {
			charWidth = context.measureText(chars[i]).width;
			if (wordWidth + charWidth > width) {
				words.push(currentWord);
				currentWord = chars[i];
				wordWidth = charWidth;
			} else {
				currentWord += chars[i];
				wordWidth += charWidth;
			}
		}
		words.push(currentWord);
		return words;
	};
	
	var _loading = false,
		_utilities = {
			// Return true if the browser supports local storage
			supportsLocalStorage: function() {
				try {
					return "localStorage" in window && window["localStorage"] !== null;
				} catch (e) {
					return false;
				}
			},
			
			// Return true if the browser supports web workers
			supportsWebWorkers: function() {
				return !!window.Worker;
			},
			
			// Show or hide the loading screen
			loading: function(show, message) {
				if (show != _loading) {
					$(".loading")[show ? "fadeIn" : "fadeOut"](show ? "fast" : "slow");
					_loading = show;
				}
				$(".loading span.progress").text(show ? message : "");
			},
			
			// Load JSON data from the server and call callback (with the data as the only argument)
			// when it is done
			loadData: function(callback, path, data) {
				if (data) {		// Data is inline
					callback(data);
				} else {		// Otherwise load data from the server
					$.ajax({
						dataType: "json",
						url: path,
						success: callback,
						error: function(request, status, error) {	// Data failed to load
							if (Z.settings.debug) {
								console.error(
									"Error loading data (%s): %O, %O",
									status, request, error
								);
							}
							callback(null);
						}
					});
				}
			},
			
			// Load an image and call callback (with the image as the only argument) when it is done
			loadImage: function(callback, path) {
				var image = new Image();
				image.onload = function() {
					callback(image);
				};
				image.onerror = function() {
					if (Z.settings.debug) {
						console.error("Error loading image (%s)", path);
					}
					callback(null);
				};
				image.src = path;
			},
			
			// Load an audio file and call callback (with the audio file as the only argument) when
			// it is done
			loadAudio: function(callback, path) {
				var audio = new Audio();
				$(audio).bind("canplaythrough", function() {
					$(audio).off("canplaythrough");		// Prevent callback from being called
														// multiple times
					callback(audio);
				});
				audio.onerror = function() {
					if (Z.settings.debug) {
						console.error("Error loading audio (%s)", path);
					}
					callback(null);
				};
				audio.src = path;
			},
			
			// Fill a rounded rectangle on the specified context using the current fill style
			//	context:	The context on which to draw the rectangle
			//	position:	The position of the rectangle
			//	size:		The size of the rectangle
			//	radius:		The border radius in pixels
			fillRoundedRectangle: function(context, position, size, radius) {
				context.save();
				drawRoundedRectanglePath(context, position, size, radius);
				context.fill();
				context.restore();
			},
			
			// Stroke a rounded rectangle on the specified context using the current stroke style
			//	context:	The context on which to draw the rectangle
			//	position:	The position of the rectangle
			//	size:		The size of the rectangle
			//	radius:		The border radius in pixels
			strokeRoundedRectangle: function(context, position, size, radius) {
				context.save();
				drawRoundedRectanglePath(context, position, size, radius);
				context.stroke();
				context.restore();
			},
			
			// Draw an arrow on the specified context using the current stroke style for the line
			// and the current fill style for the arrow head
			//	context:	The context on which to draw the arrow
			//	start:		The start of the arrow line
			//	end:		The end of the arrow line (and the position of the arrow head's tip)
			drawArrow: function(context, start, end) {
				context.save();
				
				// Line should end half of ARROW_WIDTH away from the specified end point
				var delta = vec2.sub(end, start),
					length = vec2.len(delta),
					actualEnd = vec2.add(
						start,
						vec2.mul(vec2.norm(delta), length - ARROW_WIDTH / 2)
					),
					angle = roundDirection8(vec2.sub(actualEnd, start)),
					cpOffset = vec2.mul(angle, length / CURVE_AMOUNT),
					cp1 = vec2.add(start, cpOffset),		// Bezier control points
					cp2 = vec2.sub(actualEnd, cpOffset);
				
				// Line
				context.beginPath();
				context.moveTo(start.X, start.Y);
				context.bezierCurveTo(cp1.X, cp1.Y, cp2.X, cp2.Y, actualEnd.X, actualEnd.Y);
				context.stroke();
				context.closePath();
				
				// Arrow head
				context.translate(actualEnd.X, actualEnd.Y);
				context.rotate(vec2.rad(angle));
				context.beginPath();
				context.moveTo(Math.round(-ARROW_WIDTH / 2), Math.round(-ARROW_HEIGHT / 2));
				context.lineTo(Math.round(ARROW_WIDTH / 2), 0);
				context.lineTo(Math.round(-ARROW_WIDTH / 2), Math.round(ARROW_HEIGHT / 2));
				context.closePath();
				context.fill();
				context.restore();
			},
			
			// Draw the specified text wrapped such that it will fit into the specified width and
			// return the size of the text area as a vector
			//	context:			The context on which to draw the wrapped text
			//	text:				The text to draw
			//	font:				The font to use when drawing text
			//	position:			The position at which to draw the text
			//	width:				The maximum width of the text area
			//	lineHeight:			The line height, in px
			//	padding:			Border and in-between line padding, in px
			//	colour:				The text colour
			//	backgroundColour:	The text area background colour (or no background if empty)
			//	fitText:			True if the text area should be resized down to fit the text
			//	minimumWidth:		If fitText is true, use this minimum width
			drawWrappedText: function(
				context,
				text,
				font,
				position,
				width,
				lineHeight,
				padding,
				colour,
				backgroundColour,
				fitText,
				minimumWidth
			) {
				context.save();
				context.translate(position.X, position.Y);
				context.font = font;
				
				// Split text into lines
				var words = text.split(" "),
					paddedWidth = width - (padding * 2),
					wordWidth = 0,
					lineWidth = 0,
					lines = [],
					currentLine = "",
					separator = "";
				for (var i = 0; i < words.length; i++) {	// Don't cache array length, as the
															// array might be modified during the
															// loop if a long word is split into
															// multiple words
					separator = (i == length - 1) ? "" : " ";
					wordWidth = context.measureText(words[i] + separator).width;
					
					// Add the word to the next line if it would make the current line too long
					if (lineWidth + wordWidth > paddedWidth) {
						// Check if the word by itself is longer than the line width
						if (wordWidth > paddedWidth) {
							words.splice.apply(
								words,
								[i, 1].concat(splitWord(context, words[i], paddedWidth))
							);
						}
						lines.push(currentLine);
						currentLine = words[i] + separator;
						lineWidth = wordWidth;
					
					// Otherwise add the word to the current line
					} else {
						currentLine += words[i] + separator;
						lineWidth += wordWidth;
					}
				}
				lines.push(currentLine);
				
				// Find the longest line and resize the caption width to fit if required
				var maxWidth = width,
					textAreaSize = null;
				if (fitText) {
					var currentWidth = 0;
					maxWidth = minimumWidth || 0;
					for (var i = lines.length; i--;) {
						maxWidth = Math.max(maxWidth, context.measureText(lines[i]).width);
					}
				}
				textAreaSize = vec2(
					maxWidth,
					padding + (lines.length * lineHeight) + (lines.length * padding)
				);
				
				// Draw background if background colour is set
				if (backgroundColour) {
					context.fillStyle = backgroundColour;
					Z.utilities.fillRoundedRectangle(context, vec2(), textAreaSize, 3);
				}
				
				// Draw text lines
				context.fillStyle = colour;
				context.textBaseline = "top";
				for (var i = lines.length; i--;) {
					context.fillText(
						lines[i],
						padding,
						padding + (i * padding) + (i * lineHeight)
					);
				}
				context.restore();
				return textAreaSize;
			},
			
			// Send an http request to the specified url and call either the success or failed
			// callback when the server responds
			//	url:				The url to send the request
			//	type:				The request type (GET, POST, PUT or DELETE)
			//	data:				JSON data to include in the request, or null
			//	successCallback:	This function will be called if the request was successful
			//	failedCallback:		This function will be called if the request failed
			sendRequest: function(url, type, data, successCallback, failedCallback) {
				$.ajax({
					dataType: "json",
					type: type,
					url: url,
					data: data,
					success: successCallback,
					error: function(request, status, error) {
						if (failedCallback) {
							var response = null;
							if (request.responseText) {
								try {
									response = JSON.parse(request.responseText);
								} catch (e) { }
							}
							failedCallback(response ? response.Message : "");
						}
					}
				});
			}
		};
	
	// Register loader functions
	Z.content.registerLoader("data", _utilities.loadData);
	Z.content.registerLoader("image", _utilities.loadImage);
	Z.content.registerLoader("audio", _utilities.loadAudio);
	
	return _utilities;
}());