"use strict";

// Provide IE fallback for console (ignores log request)
var console = console || { log: function() { }, warn: function() { }, error: function() { } };

// Add CSS class to document body if using IE
$(document).ready(function() {
	if (navigator.appVersion.indexOf("MSIE") != -1) {
		var version = parseFloat(navigator.appVersion.split("MSIE")[1]);
		$("body").addClass("ie ie_" + version);
	}
});

// RequestAnimationFrame cross-browser shim
window.requestAnimationFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 30);
		}
	);
})();

// CancelAnimationFrame cross-browser shim
window.cancelAnimationFrame = (function() {
	return (
		window.cancelAnimationFrame ||
		window.webkitCancelRequestAnimationFrame ||
		window.mozCancelRequestAnimationFrame ||
		window.oCancelRequestAnimationFrame ||
		window.msCancelRequestAnimationFrame ||
		clearTimeout
	);
})();

// Handle tab keypress in textarea
$(document).on("keydown", "textarea.tab", function(e) {
	var keyCode = e.keyCode || e.which;
	if (keyCode == 9) {
		e.preventDefault();
		var start = $(this).get(0).selectionStart,
			end = $(this).get(0).selectionEnd;
		
		// Insert tab character into value at the caret position
		$(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));
		
		// Re-position caret at it's previous position
		$(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
	}
});

// Array shuffle function (Fisher-Yates shuffle)
Object.defineProperty(Array.prototype, "shuffle", {
	enumerable: false,
	configurable: true,
	writable: true,
	value: function() {
		var i = this.length, r = 0, swap = null;
		if (!i) { return; }
		while (--i) {
			r = Math.floor(Math.random() * (i + 1));
			swap = this[r];
			this[r] = this[i];
			this[i] = swap;
		}
	}
});

// Get an object's keys as an array (might already exist in ES5 browsers)
if (!Object.keys) {
	Object.defineProperty(Object.prototype, "keys", {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(object) {
			var keys = [];
			for (var i in object) {
				if (object.hasOwnProperty(i)) {
					keys.push(i);
				}
			}
			return keys;
		}
	});
}

// Find an element in an array and return it's index or -1 if a matching element isn't found (might
// already exist in ES6 browsers)
if (!Array.prototype.findIndex) {
	Object.defineProperty(Array.prototype, "findIndex", {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(f) {
			var value = null;
			for (var i = 0, length = this.length; i < length; i++) {
				value = this[i];
				if (f(value, i, this)) {
					return i;
				}
			}
			return -1;
		}
	});
}

// Trim whitespace from beginning/end of string
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, ""); 
};

// Clamps a value between min and max. If either min or max are undefined, clamp between 0 and 1
Math.clamp = function(a, min, max) {
	if (min === undefined) { min = 0; };
	if (max === undefined) { max = 1; };
	return (a < min ? min : (a > max ? max : a));
};

// Does a linear interpolation from a to b and returns the result (scalar, array or vec2)
Math.lerp = function(a, b, i) {
	if (a instanceof Array && b instanceof Array) {				// Lerp array
		var result = [];
		for (var j = Math.min(a.length, b.length); j--;) {
			result[j] = a[j] * (1 - i) + b[j] * i;
		}
		return result;
	} else if (													// Lerp vec2
		a.hasOwnProperty && a.hasOwnProperty("X") && a.hasOwnProperty("Y") &&
		b.hasOwnProperty && b.hasOwnProperty("X") && b.hasOwnProperty("Y")
	) {
		return vec2(a.X * (1 - i) + b.X * i, a.Y * (1 - i) + b.Y * i);
	} else {
		return a * (1 - i) + b * i;								// Lerp scalar
	}
};

// Convert degrees to radians
Math.radians = function(degrees) {
	return (Math.PI / 180) * degrees;
};

// Convert radians to degrees
Math.degrees = function(radians) {
	return (180 / Math.PI) * radians;
};

// Return a random float between min (inclusive) and max (exclusive)
Math.randomBetween = function(min, max) {
	return Math.random() * (max - min) + min;
};

// Return a random integer between min (inclusive) and max (inclusive)
Math.randomIntBetween = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};