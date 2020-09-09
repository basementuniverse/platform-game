Z.inventoryMarker = (function(base) {
	"use strict";
	
	var _marker = Object.create(base);
	_marker.inventoryType = "";
	_marker.comparisonMode = "";
	_marker.count = 0;
	_marker.removeAmount = 0;
	_marker.create = function(data) {
		var m = base.create.call(this, data, function(a) {
				var count = 0;
				if (Z.player.inventory[data.inventoryType]) {
					count = Z.player.inventory[data.inventoryType].count;
				}
				
				// If a comparison mode has been specified, check if the player's inventory matches
				// the specified count using the comparison mode
				if (data.comparisonMode) {
					switch (data.comparisonMode) {
						case "equal":
							return count == data.count;
						case "less":
							return count < data.count;
						case "more":
							return count > data.count;
						default: break
					}
				}
				
				// Otherwise return true/false depending on whether the specified item exists in
				// the player's inventory
				return !!count;
			});
		m.type = "inventory";
		m.inventoryType = data.inventoryType || "";
		m.comparisonMode = data.comparisonMode || "";
		m.count = data.count || 0;
		m.removeAmount = Math.abs(data.removeAmount || 0);
		return m;
	};
	_marker.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.inventoryType = this.inventoryType;
		data.comparisonMode = this.comparisonMode;
		data.count = this.count;
		data.removeAmount = this.removeAmount;
		return data;
	};
	_marker.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.inventoryType = "";
		data.comparisonMode = "equal";
		data.count = 0;
		data.removeAmount = 0;
		return data;
	};
	_marker.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Inventory type
		var inventoryTypes = [];
		for (var i in Z.content.items) {
			if (
				Z.content.items.hasOwnProperty(i) &&
				Z.content.items[i].baseType == "inventory"
			) {
				inventoryTypes.push({
					label: Z.content.items[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Inventory Type",
			id: "inventoryType",
			type: Z.editorPropertyType.select,
			options: inventoryTypes
		});
		
		// Comparison mode
		properties.push({
			name: "Comparison",
			id: "comparisonMode",
			type: Z.editorPropertyType.select,
			options: [
				{
					label: "Equal to",
					value: "equal"
				},
				{
					label: "Less than",
					value: "less"
				},
				{
					label: "More than",
					value: "more"
				}
			]
		});
		
		// Count
		properties.push({
			name: "Count",
			id: "count",
			type: Z.editorPropertyType.number,
			round: true
		});
		
		// Remove amount
		properties.push({
			name: "Remove",
			id: "removeAmount",
			type: Z.editorPropertyType.number,
			round: true
		});
		return properties;
	};
	_marker.setState = function(activated) {
		base.setState.apply(this, arguments);
		
		// When this marker is activated, check if any inventory items should be removed (since
		// items will be removed, there is no need to specify a sprite or stackable/maximum count)
		if (activated && this.removeAmount) {
			Z.player.addInventory(this.inventoryType, null, -this.removeAmount, false, 1);
		}
	};
	return _marker;
}(Z.collisionMarker));