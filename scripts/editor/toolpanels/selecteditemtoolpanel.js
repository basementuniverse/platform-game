Z.selectedItemToolPanel = (function() {
	"use strict";
	
	var _itemSnapshots = [];	// A stack of item snapshots (used when editing item properties so
								// that item position and size changes aren't lost)
	
	return {
		update: function() {
			// Clear current properties
			$(".toolpanelcontent.selecteditem .itemproperties").empty();
			
			// Make sure there is a selected item to display
			if (!Z.editor.selectedItem) { return; }
			
			// TODO list item properties
			
			// TEMP show JSON editor
			var itemDataText = JSON.stringify(Z.editor.selectedItem.item.getData(), null, "\t"),
				newItemDataText = "",
				textArea = $("<textarea class='tab'>").text(itemDataText);
			$(".toolpanelcontent.selecteditem .itemproperties").append(
				$("<div class='itempropertiesinner'>").append(
					textArea,
					$("<a href='javascript:void(0)' class='button updateitembutton'>")
					.text("Update")
					.click(function() {
						// Try to parse JSON data in textarea
						var newItemData = null;
						newItemDataText = textArea.val();
						try {
							newItemData = JSON.parse(newItemDataText);
						} catch (e) {
							console.error("JSON parse error: " + e);
							return;
						}
						
						// Get a reference to the original item (stored in this closure's context
						// so it can be used if the action is undone/redone)
						var item = Z.editor.selectedItem.item,
							list = {
								"actor": "actors",
								"entity": "entities",
								"light": "lights"
							}[item.itemType];
						
						// Use the item's current position and size (if available)
						if (item.position) {
							newItemData.position = [item.position.X, item.position.Y];
						}
						if (item.size && item.size.X !== undefined && item.size.Y !== undefined) {
							newItemData.size = [item.size.X, item.size.Y];
						}
						
						// Create a new item using the modified data
						var after = Z[item.itemType + "Factory"].create(newItemData);
						
						// Push an action onto the stack
						Z.actionList.performAction(
							"update item " + item.id,
							function() {
								// Update the item in the current map
								var index = -1;
								if ((index = Z.editor.map[list].findIndex(function(v) {
									return v.id == item.id;
								})) > -1) {
									Z.editor.map[list][index] = after;
									Z.editor.map[list + "ById"][item.id] = after;
								}
								
								// Re-build inputs list if the modified item is an entity
								if (item.itemType == "entity") {
									after.inputs = [];
									for (var i = after.inputIds.length; i--;) {
										if (Z.editor.map.entitiesById[after.inputIds[i]]) {
											after.inputs.push(
												Z.editor.map.entitiesById[after.inputIds[i]]
											);
										}
									}
								}
								
								// Set the textarea contents
								textArea.val(newItemDataText);
								
								// Set map to dirty so it's data will be written to the world when
								// the editor map is changed
								Z.editor.map.dirty = true;
								
								// Re-draw the editor
								Z.editor.draw();
								
								// Update the item list
								Z.itemListToolPanel.update();
							},
							function() {
								// Revert the item in the current map back to the original item
								var index = -1;
								if ((index = Z.editor.map[list].findIndex(function(v) {
									return v.id == item.id;
								})) > -1) {
									Z.editor.map[list][index] = item;
									Z.editor.map[list + "ById"][item.id] = item;
								}
								
								// Re-build inputs list if the modified item is an entity
								if (item.itemType == "entity") {
									item.inputs = [];
									for (var i = item.inputIds.length; i--;) {
										if (Z.editor.map.entitiesById[item.inputIds[i]]) {
											item.inputs.push(
												Z.editor.map.entitiesById[item.inputIds[i]]
											);
										}
									}
								}
								
								// Set the textarea contents
								textArea.val(itemDataText);
								
								// Set map to dirty so it's data will be written to the world when
								// the editor map is changed
								Z.editor.map.dirty = true;
								
								// Re-draw the editor
								Z.editor.draw();
								
								// Update the item list
								Z.itemListToolPanel.update();
							}
						);
					})
				)
			);
			
			// TEMP show editable properties
			/*var properties = Z.editor.selectedItem.item.getEditorProperties(),
				propertiesList = "";
			for (var i = 0, length = properties.length; i < length; i++) {
				propertiesList += properties[i].name + " (" + properties[i].id + ")\n";
			}
			$(".toolpanelcontent.selecteditem .itemproperties").append(
				$("<pre>").text(propertiesList)
			);*/
			
			// Update the click handler on the delete item button
			$(".toolpanelcontent.selecteditem .button.deletebutton")
			.off("click")
			.click(Z.editor.selectedItem.remove);
		}
	};
}());