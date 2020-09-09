Z.backgroundsDialog = (function() {
	"use strict";
	
	var _removed = [];	// A list of functions that will remove backgrounds when the dialog
						// is updated (this is cleared when the dialog is initialised)
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button updates and closes the dialog
		$(".dialog.backgrounds .closebutton").click(function() {
			Z.dialogs.toggle("backgrounds", false);
		});
		
		// Reset button re-initialises the dialog
		$(".dialog.backgrounds .resetbutton").click(function() {
			Z.backgroundsDialog.initialise();
		});
		
		// Add button adds an empty item to the list
		$(".dialog.backgrounds .addbutton").click(function() {
			Z.backgroundsDialog.add();
		});
	});
	
	// Add a row to the list
	var addRow = function(id, path) {
		var idInput = $("<input type='text' class='background_id'>").val(id),
			originalIdInput = $("<input type='hidden' class='background_originalid'>").val(id),
			pathInput = $("<input type='text' class='background_path'>").val(path),
			item = $("<div class='item background'>")
				.append(
					$("<div class='inputcontainer inputid'>")
					.append(idInput)
					.append(originalIdInput)
				).append(
					$("<div class='inputcontainer inputpath'>")
					.append(pathInput)
				);
		
		// If this is a new background (ie. the id is empty) then append a newitem hidden input
		if (!id) {
			item.append($("<input type='hidden' class='background_newitem'>").val(1));
		}
		
		// Append delete button to item
		item.append(
			$("<a href='javascript:void(0)' class='button deletebutton' data-tooltip='Remove'>")
			.click(function() {
				Z.backgroundsDialog.remove(
					originalIdInput.val() || idInput.val(),
					item
				);
			})
			.tooltip({
				anchorX: -1,
				anchorY: 0,
				originX: 1,
				offsetX: -8,
				className: "tooltip-arrow tooltip-arrow-right"
			})
		);
		
		// Append item to the list
		$(".dialog.backgrounds .items").append(item);
	};
	
	// Add an error message to the dialog
	var addError = function(message, item) {
		$("<div class='error'>").text(message).appendTo(item);
	};
	
	var _backgroundsDialog = {
		cssClass: "showbackgrounds",	// The CSS classname to add to the document body in order
										// to display this dialog screen
		// Initialise the list of backgrounds in the current world
		initialise: function() {
			_removed = [];
			$(".dialog.backgrounds .item.background").remove();
			for (var i in Z.world.backgroundImagePaths) {
				if (!Z.world.backgroundImagePaths.hasOwnProperty(i)) { continue; }
				addRow(i, Z.world.backgroundImagePaths[i]);
			}
		},
		
		// Add an empty row to the list
		add: function() {
			addRow("", "");
		},
		
		// Remove a background from the list, the current world and any maps that are using it
		remove: function(id, element) {
			// Remove without prompting if this item doesn't have an id or path
			if (id == "" && element.find(".background_path").val() == "") {
				element.find(".deletebutton").tooltip("destroy");
				element.remove();
				return;
			}
			
			// Check if this background is being used by any maps
			var mapsUsingBackground = [],
				usingPrompt = "";
			if (id) {
				for (var i in Z.world.maps) {
					if (!Z.world.maps.hasOwnProperty(i)) { continue; }
					if (Z.world.maps[i].background.backgroundImageId == id) {
						mapsUsingBackground.push(Z.world.maps[i]);
					}
				}
				
				// If any maps are using this background, notify the user in the prompt text
				if (mapsUsingBackground.length > 0) {
					usingPrompt = mapsUsingBackground.length == 1 ?
						"There is 1 map using it." :
						" There are " + mapsUsingBackground.length + " maps using it.";
				}
			}
			
			// Display prompt
			Z.prompt.show(
				"Are you sure you want to delete this background?" + usingPrompt,
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							// Remove item element
							element.remove();
							
							// Add a function to remove the background to the removed list so that
							// the background can be removed when the dialog is updated
							_removed.push(function() {
								Z.backgroundItem.remove(id, mapsUsingBackground);
								
								// Notify the editor that changes have been made
								Z.toolbar.setDirty(true);
							});
						}
					},
					{
						text: "No",
						cssClass: "cancelbutton",
						callback: null
					}
				]
			);
		},
		
		// Update the list of backgrounds in the current world to match the dialog list
		//	callback:	A function to call when finished updating the list, this function should
		//				close the dialog (this function won't be called if any errors occur)
		update: function(callback) {
			var existingIds = Object.keys(Z.world.backgroundImages),
				imagesToLoad = [],
				success = true;
			
			// Remove all current error messages
			$(".dialog.backgrounds .error").remove();
			
			// Remove all deleted backgrounds
			for (var i = _removed.length; i--;) {
				_removed[i]();
			}
			
			// Iterate over each item in the list and update the world accordingly
			$(".dialog.backgrounds .item.background").each(function(i, v) {
				var item = $(v),
					id = item.find(".background_id").val(),
					originalId = item.find(".background_originalid").val(),
					path = item.find(".background_path").val();
				
				// Make sure there is an id
				if (!id) {
					addError("Background image id must not be empty.", item);
					success = false;
					return;
				}
				
				// Make sure there is a path
				if (!path) {
					addError("Background image path must not be empty.", item);
					success = false;
					return;
				}
				
				// If this is an existing item and it is unchanged, continue on to the next item
				if (
					id == originalId &&
					Z.world.backgroundImages[id] &&
					Z.world.backgroundImagePaths[id] == path
				) {
					return;
				}
				
				// Otherwise, changes have been made to the world data
				Z.toolbar.setDirty(true);
				
				// Make sure this item's id is unique (only if creating a new background or
				// updating the id of an existing background)
				if (existingIds.indexOf(id) > -1 && (!originalId || originalId != id)) {
					addError("There is already a background with the same id.", item);
					success = false;
					return;
				}
				
				// If this is a new item (originalId will be empty), try to load the image
				if (!originalId) {
					imagesToLoad.push({
						path: path,
						item: item,
						callback: function(image) {
							Z.backgroundItem.add(id, path, image);
							existingIds.push(id);
						}
					});
				} else {	// An existing background is being updated
					// Id is being changed
					if (id != originalId) {
						Z.backgroundItem.updateId(originalId, id);
						
						// Update existingIds list
						existingIds.splice(existingIds.indexOf(originalId), 1);
						existingIds.push(id);
						originalId = id;	// Update originalId so that path check below doesn't
											// immediately reload the image into the old id index
					}
					
					// Path is being changed
					if (Z.world.backgroundImagePaths[originalId] != path) {
						imagesToLoad.push({
							path: path,
							item: item,
							callback: function(image) {
								Z.backgroundItem.updatePath(originalId, path, image);
							}
						});
					}
				}
			});
			
			// Load any images that have been added/updated
			if (imagesToLoad.length) {
				Z.utilities.loading(true);
				var count = 0,
					imagesToLoadSuccess = true;
				for (var i = imagesToLoad.length; i--;) {
					(function(imageToLoad) {
						Z.utilities.loadImage(function(image) {
							if (!image) {	// Image failed to load
								addError(
									"Couldn't load image from " + imageToLoad.path,
									imageToLoad.item
								);
								imagesToLoadSuccess = false;
							} else {		// Image loaded, add it to the world
								imageToLoad.callback(image);
							}
							
							// Check if all images have finished loading and if any error occurred
							if (++count >= imagesToLoad.length) {
								Z.utilities.loading(false);
								if (imagesToLoadSuccess) {
									callback();
								}
							}
						}, imageToLoad.path);
					}(imagesToLoad[i]));
				}
			} else if (success) {	// No images to load and no errors, callback immediately
				callback();
			}
		}
	};
	
	// Register dialog
	Z.dialogs.registerDialog("backgrounds", _backgroundsDialog);
	
	return _backgroundsDialog;
}());