Z.numberInput = (function() {
	"use strict";
	
	// Make sure the value of input is a number (or 0 if empty)
	var check = function(input) {
		var value = input.val(),
			min = input.attr("min"),
			max = input.attr("max"),
			c = function(n, d) {
				if (n === null || n === undefined) {
					n = d;
				} else {
					n = parseFloat(n);
					n = isNaN(n) ? d : n;
				}
				return n;
			};
		min = c(min, -Infinity);
		max = c(max, Infinity);
		input.val(Math.clamp(c(value, 0), min, max));
	};
	
	// Initialise number input controls
	$(document).ready(function() {
		$("input.number")
		.each(function(k, v) { check($(v)); })
		.change(function() {
			check($(this));
		});
	});
}());