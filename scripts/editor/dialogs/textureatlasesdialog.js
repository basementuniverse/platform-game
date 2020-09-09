Z.textureAtlasesDialog = (function() {
	"use strict";
	
	var _removed = [];	// A list of functions that will remove texture atlases when the dialog
						// is updated (this is cleared when the dialog is initialised)
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button updates and closes the dialog
		$(".dialog.textureatlases .closebutton").click(function() {
			Z.dialogs.toggle("textureatlases", false);
		});
		
		// Reset button re-initialises the dialog
		$(".dialog.textureatlases .resetbutton").click(function() {
			Z.textureAtlasesDialog.initialise();
		});
		
		// Add button adds an empty item to the list
		$(".dialog.textureatlases .addbutton").click(function() {
			Z.textureAtlasesDialog.add();
		});
	});
	
	// Add a row to the list
	var addRow = function(id, path) {
		var idInput = $("<input type='text' class='textureatlas_id'>").val(id),
			originalIdInput = $("<input type='hidden' class='textureatlas_originalid'>").val(id),
			pathInput = $("<input type='text' class='textureatlas_path'>").val(path),
			item = $("<div class='item textureatlas'>")
				.append(
					$("<div class='inputcontainer inputid'>")
					.append(idInput)
					.append(originalIdInput)
				).append(
					$("<div class='inputcontainer inputpath'>")
					.append(pathInput)
				);
		
		// If this is a new texture atlas (ie. the id is empty) then append a newitem hidden input
		if (!id) {
			item.append($("<input type='hidden' class='textureatlas_newitem'>").val(1));
		}
		
		// Append delete button to item
		item.append(
			$("<a href='javascript:void(0)' class='button deletebutton' data-tooltip='Remove'>")
			.click(function() {
				Z.textureAtlasesDialog.remove(
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
		$(".dialog.textureatlases .items").append(item);
	};
	
	// Add an error message to the dialog
	var addError = function(message, item) {
		$("<div class='error'>").text(message).appendTo(item);
	};
	
	var _textureAtlasesDialog = {
		cssClass: "showtextureatlases",	// The CSS classname to add to the document body in order
										// to display this dialog screen
		// Initialise the list of texture atlases in the current world
		initialise: function() {
			_removed = [];
			$(".dialog.textureatlases .item.textureatlas").remove();
			for (var i in Z.world.textureAtlasPaths) {
				if (!Z.world.textureAtlasPaths.hasOwnProperty(i)) { continue; }
				addRow(i, Z.world.textureAtlasPaths[i]);
			}
		},
		
		// Add an empty row to the list
		add: function() {
			addRow("", "");
		},
		
		// Remove a texture atlas from the list, the current world and any tiles that are using it
		remove: function(id, element) {
			// Remove without prompting if this item doesn't have an id or path
			if (id == "" && element.find(".textureatlas_path").val() == "") {
				element.find(".deletebutton").tooltip("destroy");
				element.remove();
				return;
			}
			
			// Check if this texture atlas is being used by any tile types
			var tilesUsingTexture = [],
				usingPrompt = "";
			if (id) {
				for (var i in Z.world.tileTypes) {
					if (!Z.world.tileTypes.hasOwnProperty(i)) { continue; }
					if (Z.world.tileTypes[i].textureAtlas == id) {
						tilesUsingTexture.push(Z.world.tileTypes[i]);
					}
				}
				
				// If any tiles are using this texture atlas, notify the user in the prompt text
				if (tilesUsingTexture.length > 0) {
					usingPrompt = tilesUsingTexture.length == 1 ?
						"There is 1 tile type using it." :
						" There are " + tilesUsingTexture.length + " tile types using it.";
				}
			}
			
			// Display prompt
			Z.prompt.show(
				"Are you sure you want to delete this texture atlas?" + usingPrompt,
				[
					{
						text: "Yes",
						cssClass: "okbutton",
						callback: function() {
							// Remove item element
							element.remove();
							
							// Add a function to remove the texture atlas to the removed list so
							// that the texture atlas can be removed when the dialog is updated
							_removed.push(function() {
								Z.textureAtlasItem.remove(id, tilesUsingTexture);
								
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
		
		// Update the list of texture atlases in the current world to match the dialog list
		//	callback:	A function to call when finished updating the list, this function should
		//				close the dialog (this function won't be called if any errors occur)
		update: function(callback) {
			var existingIds = Object.keys(Z.world.textureAtlases),
				imagesToLoad = [],
				success = true;
			
			// Remove all current error messages
			$(".dialog.backgrounds .error").remove();
			
			// Remove all deleted texture atlases
			for (var i = _removed.length; i--;) {
				_removed[i]();
			}
			
			// Iterate over each item in the list and update the world accordingly
			$(".dialog.textureatlases .item.textureatlas").each(function(i, v) {
				var item = $(v),
					id = item.find(".textureatlas_id").val(),
					originalId = item.find(".textureatlas_originalid").val(),
					path = item.find(".textureatlas_path").val();
				
				// Make sure there is an id
				if (!id) {
					addError("Texture atlas id must not be empty.", item);
					success = false;
					return;
				}
				
				// Make sure there is a path
				if (!path) {
					addError("Texture atlas path must not be empty.", item);
					success = false;
					return;
				}
				
				// If this is an existing item and it is unchanged, continue on to the next item
				if (
					id == originalId &&
					Z.world.textureAtlases[id] &&
					Z.world.textureAtlasPaths[id] == path
				) {
					return;
				}
				
				// Otherwise, changes have been made to the world data
				Z.toolbar.setDirty(true);
				
				// Make sure this item's id is unique (only if creating a new texture atlas or
				// updating the id of an existing texture atlas)
				if (existingIds.indexOf(id) > -1 && (!originalId || originalId != id)) {
					addError("There is already a texture atlas with the same id.", item);
					success = false;
					return;
				}
				
				// If this is a new item (originalId will be empty), try to load the image
				if (!originalId) {
					imagesToLoad.push({
						path: path,
						item: item,
						callback: function(image) {
							Z.textureAtlasItem.add(id, path, image);
							existingIds.push(id);
						}
					});
				} else {	// An existing texture atlas is being updated
					// Id is being changed
					if (id != originalId) {
						Z.textureAtlasItem.updateId(originalId, id);
						
						// Update existingIds list
						existingIds.splice(existingIds.indexOf(originalId), 1);
						existingIds.push(id);
						originalId = id;	// Update originalId so that path check below doesn't
											// immediately reload the image into the old id index
					}
					
					// Path is being changed
					if (Z.world.textureAtlasPaths[originalId] != path) {
						imagesToLoad.push({
							path: path,
							item: item,
							callback: function(image) {
								Z.textureAtlasItem.updatePath(originalId, path, image);
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
	Z.dialogs.registerDialog("textureatlases", _textureAtlasesDialog);
	
	return _textureAtlasesDialog;
}());