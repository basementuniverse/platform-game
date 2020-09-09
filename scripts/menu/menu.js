Z.menu = (function() {
	"use strict";
	
	var ITEM_MARGIN = 10;
	
	// Calculate menu position in 1 dimension from anchor and offset amount
	//	anchor:	The anchor for this dimension (<0 is top/left, 0 is center, >0 is bottom/right)
	//	menu:	Menu size
	//	screen:	Screen size
	//	offset:	Offset amount
	var anchorOffset = function(anchor, menu, screen, offset) {
		if (anchor < 0) {
			return offset;
		}
		if (anchor > 0) {
			return screen - menu + offset;
		}
		return screen / 2 - menu / 2 + offset;
	};
	
	return {
		anchor: vec2(),
		offset: vec2(),
		size: vec2(),
		items: [],
		selectedIndex: 0,
		create: function(anchor, offset) {
			var m = Object.create(this);
			m.anchor = anchor;
			m.offset = offset;
			m.items = [];
			return m;
		},
		push: function(item) {
			this.items.push(item);
			
			// Calculate menu size
			var length = this.items.length,
				size = vec2(0, length * this.items[0].size.Y + (length - 1) * ITEM_MARGIN);
			for (var i = length; i--;) {
				size.X = Math.max(size.X, this.items[i].size.X);
			}
			this.size = size;
			
			// Reset menu item widths
			for (var i = length; i--;) {
				this.items[i].size.X = this.size.X;
			}
		},
		handleInput: function() {
			// Keyboard select
			if (Z.input.keyPressed(Keys.Up)) {
				this.selectedIndex--;
				if (this.selectedIndex < 0) {
					this.selectedIndex = this.items.length - 1;
				}
			} else if (Z.input.keyPressed(Keys.Down)) {
				this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
			}
			
			// Activate selected item
			if (Z.input.keyPressed(Keys.Enter) && this.items[this.selectedIndex].action) {
				this.items[this.selectedIndex].action();
			}
		},
		update: function(elapsedTime) {
			// Check for item selection
			this.handleInput();
			
			// Update menu items
			for (var i = this.items.length; i--;) {
				this.items[i].update(elapsedTime, i, this.selectedIndex);
			}
		},
		draw: function(context, width, height, state) {
			if (!this.items.length) { return; }
			context.save();
			context.translate(
				anchorOffset(this.anchor.X, this.size.X, width, this.offset.X),
				anchorOffset(this.anchor.Y, this.size.Y, height, this.offset.Y)
			);
			
			// Draw menu items
			for (var i = this.items.length; i--;) {
				this.items[i].draw(context, width, height, i, ITEM_MARGIN, state);
			}
			context.restore();
		}
	};
}());