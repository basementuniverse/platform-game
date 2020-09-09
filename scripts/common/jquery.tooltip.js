(function($) {
	$.fn.tooltip = function(options) {
		return this.each(function() {
			var element = $(this);
			
			// If the options argument is a string, update the tooltip's text or destroy the
			// tooltip depending on the command
			if (typeof options == "string") {
				var id = element.data("tooltip-id");
				switch (options) {
					case "update":
						$(".tooltip#" + id + " .tooltip-inner").html(element.data("tooltip"));
						break;
					case "destroy":
						$(".tooltip#" + id).off(
							"mouseover.tooltip_" + id + " " +
							"mousemove.tooltip_" + id + " " +
							"mouseout.tooltip_" + id
						);
						$(document).off("mousemove.tooltip_" + id);
						$(window).off("resize.tooltip_" + id);
						$(".tooltip#" + id).remove();
						break;
					default: break;
				}
				return;
			}
			
			// Otherwise, create a tooltip element with a unique id and keep track of the id in the
			// host element's data-tooltip-id attribute
			var tooltip = $("<div class='tooltip'>").append(
					$("<div class='tooltip-inner'>").html(element.data("tooltip"))
				),
				tooltipSize = { width: 0, height: 0 },
				mousePosition = { x: 0, y: 0 },
				hoverDelayTimeout = null,
				appended = false,
				guid = function() {
					return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				},
				uid = guid() + guid() + guid();
			element.data("tooltip-id", uid);
			tooltip.attr("id", uid);
			
			// Get settings for this element (check data attributes first, then use options
			// argument, then use default values)
			var data = {
					anchorX: element.data("tooltip-anchor-x"),
					anchorY: element.data("tooltip-anchor-y"),
					originX: element.data("tooltip-origin-x"),
					originY: element.data("tooltip-origin-y"),
					offsetX: element.data("tooltip-offset-x"),
					offsetY: element.data("tooltip-offset-y"),
					display: element.data("tooltip-display"),
					delay: element.data("tooltip-delay"),
					className: element.data("tooltip-classname")
				},
				o = $.extend({}, $.fn.tooltip.defaults, options, data);
			
			// Apply custom class name(s)
			tooltip.addClass(o.className);
			
			// Append tooltip off-screen, get size and then remove
			tooltip.css({ top: -1000, left: -1000 }).appendTo(document.body);
			tooltipSize.width = tooltip.outerWidth();
			tooltipSize.height = tooltip.outerHeight();
			tooltip.remove();
			
			// If this tooltip is always displayed and it's anchor position is null, set it's
			// anchor position to (0, 0)
			if (o.display == "always") {
				if (o.anchorX == null) { o.anchorX = 0; }
				if (o.anchorY == null) { o.anchorY = 0; }
			}
			
			// Calculate tooltip position
			var getPosition = function(position) {
				position = position || mousePosition;
				var elementPosition = element.offset(),
					elementSize = {
						width: element.outerWidth(),
						height: element.outerHeight()
					};
				
				// Refresh tooltip size
				if (appended) {
					tooltipSize.width = tooltip.outerWidth();
					tooltipSize.height = tooltip.outerHeight();
				}
				
				// Show/hide tooltip depending on whether it has any content
				tooltip.toggleClass("hidden", tooltip.find(".tooltip-inner").html() == "");
				
				// Calculate offset amount from corner (-1, 0 or 1) and dimension
				var offset = function(c, d) { return c > 0 ? d : (c == 0 ? (d / 2) : 0); }
				
				// Set anchor position
				var anchor = {
					x: o.anchorX == null ?
						position.x :
						elementPosition.left + offset(o.anchorX, elementSize.width),
					y: o.anchorY == null ?
						position.y :
						elementPosition.top + offset(o.anchorY, elementSize.height)
				};
				
				// Set origin
				var origin = {
					x: offset(o.originX, tooltipSize.width),
					y: offset(o.originY, tooltipSize.height)
				};
				
				// Calculate final position with added offset
				return {
					top: anchor.y - origin.y + o.offsetY,
					left: anchor.x - origin.x + o.offsetX
				};
			};
			
			// Show the tooltip
			var show = function() {
				if (!appended) {
					appended = true;
					tooltip.appendTo(document.body);
				}
			};
			
			// Hide the tooltip
			var hide = function() {
				if (appended) {
					appended = false;
					tooltip.remove();
				}
			};
			
			// Attach events if this is a hover tooltip
			if (o.display == "hover") {
				element
				.on("mouseover.tooltip_" + uid + " mousemove.tooltip_" + uid, function(e) {
					if (o.delay > 0 && !hoverDelayTimeout) {
						hoverDelayTimeout = setTimeout(function() {
							tooltip.css(getPosition());
							show();
						}, o.delay);
					} else if (o.delay <= 0) {
						tooltip.css(getPosition());
						show();
					}
				})
				.on("mouseout.tooltip_" + uid, function() {
					clearTimeout(hoverDelayTimeout);
					hoverDelayTimeout = null;
					hide();
				});
				$(document).on("mousemove.tooltip_" + uid, function(e) {
					mousePosition.x = e.pageX;
					mousePosition.y = e.pageY;
					tooltip.css(getPosition());
				});
			
			// Otherwise append tooltip once
			} else if (o.display == "always") {
				tooltip.appendTo(document.body);
				
				// Initialise tooltip position shortly after initialisation to pick up any initial
				// changes in the host element's position or size
				setTimeout(function() {
					tooltip.css(getPosition({ x: 0, y: 0 }));
				}, 100);
				
				// Move tooltip when window resizes
				$(window).on("updatetooltippositions resize.tooltip_" + uid, function() {
					tooltip.css(getPosition({ x: 0, y: 0 }));
				}).trigger("resize");
			}
		});
	};
	
	// Default settings
	$.fn.tooltip.defaults = {
		anchorX: null,			// Host element anchor point
		anchorY: null,			// 	-1		top/left
								//	0		center
								//	1		bottom/right
								//	null	use mouse position
		originX: 0,				// Tooltip origin corner
		originY: 0,				//	-1		top/left
								//	0		center
								//	1		bottom/right
		offsetX: 0,				// X offset in pixels
		offsetY: 0,				// Y offset in pixels
		display: "hover",		// Display condition ('always' or 'hover')
		delay: 200,				// Delay time after detecting mouse hover
		className: ""			// Additional class names to add to the tooltip element
	};
}(jQuery));