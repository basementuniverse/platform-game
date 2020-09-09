Z.itemResize = (function() {
	"use strict";
	
	var MINIMUM_SIZE = 10,
		RESIZE_MARGIN_OUTER = 10,
		RESIZE_MARGIN_INNER = 4;
	
	var _itemSnapshots = [];	// A stack of item snapshots (used for item drag actions)
	
	// Check if the mouse pointer is within range of a resize handle on the selected item
	var checkResizeHandles = function() {
		var item = Z.editor.selectedItem.item,
			delta = vec2.sub(Z.input.mouseWorldPosition, item.position);
		
		// Top left corner
		var tl = {
			direction: vec2(-1, -1),
			cssClass: "nw",
			start: vec2(-RESIZE_MARGIN_OUTER, -RESIZE_MARGIN_OUTER),
			end: vec2(RESIZE_MARGIN_INNER, RESIZE_MARGIN_INNER)
		};
		
		// Top right corner
		var tr = {
			direction: vec2(1, -1),
			cssClass: "ne",
			start: vec2(item.size.X - RESIZE_MARGIN_INNER, -RESIZE_MARGIN_OUTER),
			end: vec2(item.size.X + RESIZE_MARGIN_OUTER, RESIZE_MARGIN_INNER)
		};
		
		// Bottom left corner
		var bl = {
			direction: vec2(-1, 1),
			cssClass: "sw",
			start: vec2(-RESIZE_MARGIN_OUTER, item.size.Y - RESIZE_MARGIN_INNER),
			end: vec2(RESIZE_MARGIN_INNER, item.size.Y + RESIZE_MARGIN_OUTER)
		};
		
		// Bottom right corner
		var br = {
			direction: vec2(1, 1),
			cssClass: "se",
			start: vec2(item.size.X - RESIZE_MARGIN_INNER, item.size.Y - RESIZE_MARGIN_INNER),
			end: vec2(item.size.X + RESIZE_MARGIN_OUTER, item.size.Y + RESIZE_MARGIN_OUTER)
		};
		
		// Top edge
		var t = {
			direction: vec2(0, -1),
			cssClass: "n",
			start: vec2(tl.end.X, tl.start.Y),
			end: vec2(tr.start.X, tl.end.Y)
		};
		
		// Bottom edge
		var b = {
			direction: vec2(0, 1),
			cssClass: "s",
			start: vec2(bl.end.X, bl.start.Y),
			end: vec2(br.start.X, bl.end.Y)
		};
		
		// Left edge
		var l = {
			direction: vec2(-1, 0),
			cssClass: "w",
			start: vec2(tl.start.X, tl.end.Y),
			end: vec2(tl.end.X, bl.start.Y)
		};
		
		// Right edge
		var r = {
			direction: vec2(1, 0),
			cssClass: "e",
			start: vec2(tr.start.X, tr.end.Y),
			end: vec2(tr.end.X, br.start.Y)
		};
		
		// Check if any resize handles are currently being hovered over
		var handles = [tl, tr, bl, br, t, b, l, r];
		for (var i = handles.length; i--;) {
			if (pointInRectangle(delta, handles[i])) {
				return handles[i];
			}
		}
		return null;
	};
	
	// Return true if point p is inside rect (defined by start and end position)
	var pointInRectangle = function(p, rect) {
		return (
			p.X >= rect.start.X && p.X <= rect.end.X &&
			p.Y >= rect.start.Y && p.Y <= rect.end.Y
		);
	};
	
	return {
		minimumSize: MINIMUM_SIZE,
		resizing: false,			// True if the user is currently resizing the selected item
		direction: vec2(),			// The current edge being resized
		initialPosition: vec2(),	// The initial position of the selected item
		initialSize: vec2(),		// The initial size of the selected item
		resizeOffset: vec2(),		// The mouse click offset from the selected item's position
		
		// Handle mouse hover and actor/entity resizing
		handleMouseInput: function(down, clicked) {
			// If there is no currently selected item, don't show the resize tool
			if (!Z.editor.selectedItem) { return; }
			
			// Check if any resize handles are currently hovered
			var handle = checkResizeHandles(),
				item = Z.editor.selectedItem.item;
			
			// Add a class to the editor container element if a resize handle is hovered to
			// indicate that the item can be resized, unless currently resizing an item (in which
			// case, the editor should retain the same class that was added when the user started
			// resizing the element)
			if (!this.resizing) {
				$("div.editor")
				.removeClass("n s e w ne se sw nw")
				.toggleClass("resizeitemtool " + (handle ? handle.cssClass : ""), handle != null);
			}
			
			// Handle resize input and item resizing
			if (handle || this.resizing) {
				// User has started dragging the resize handle
				if (clicked) {
					this.resizing = true;
					this.direction = handle.direction;
					this.initialPosition = vec2(item.position);
					this.initialSize = vec2(item.size);
					this.resizeOffset = vec2(Z.input.mouseWorldPosition);
					_itemSnapshots.push(item.getSnapshot());
				}
				
				// User is dragging the resize handle
				if (down && this.resizing && item.handleResize) {
					item.handleResize(Z.editor.selectedItem);
				}
				
				// User has finished dragging the resize handle
				if (!clicked && !down && this.resizing) {
					this.resizing = false;
					var before = _itemSnapshots.pop(),
						after = before.item.getSnapshot();
					
					// If the item's size or position was changed, create an action
					if (
						!vec2.eq(before.size, after.size) ||
						!vec2.eq(before.position, after.position)
					) {
						Z.actionList.performAction(
							"resize " + before.item.id,
							function() {
								before.item.setSnapshot(after);
								Z.editor.draw();
							},
							function() {
								before.item.setSnapshot(before);
								Z.editor.draw();
							},
							true
						);
					}
				}
			}
		},
		draw: function(context) { }
	};
}());