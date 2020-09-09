Z.toolbar = (function() {
	"use strict";
	
	// Initialise toolbar button click handlers when document has finished loading
	$(document).ready(function() {
		// Save button saves the current world to the server
		$(".button.savebutton").click(function() {
			Z.dialogs.closeAll(Z.editor.save);
		});
		
		// Select tool button sets the editor tool mode
		$(".button.selectbutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.toolbar.setEditorTool(Z.editorTool.select);
		});
		
		// Move tool button sets the editor tool mode
		$(".button.movecamerabutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.toolbar.setEditorTool(Z.editorTool.move);
		});
		
		// Tile tool button sets the editor tool mode
		$(".button.tilebutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.toolbar.setEditorTool(Z.editorTool.tile);
		});
		
		// World/map properties dialog button toggles the properties dialog
		$(".button.propertiesbutton").click(function() {
			Z.dialogs.toggle("worldproperties");
		});
		
		// Texture atlases dialog button toggles the texture atlases dialog
		$(".button.textureatlasesbutton").click(function() {
			Z.dialogs.toggle("textureatlases");
		});
		
		// Backgrounds dialog button toggles the backgrounds dialog
		$(".button.backgroundsbutton").click(function() {
			Z.dialogs.toggle("backgrounds");
		});
		
		// Undo button undoes the most recent action
		$(".button.undobutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.actionList.undo();
		});
		
		// Redo button redoes the most recently undone action
		$(".button.redobutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.actionList.redo();
		});
		
		// Add map button (in map select menu) adds a new empty map
		$(".addmapbutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.map.add();
		});
		
		// Delete map button deletes the current map
		$(".button.deletemapbutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			Z.map.remove();
		});
		
		// Toolpanel toggle button shows/hides the tool panel (unless any dialogs are open)
		$(".button.toolpanelbutton").click(function() {
			if ($(this).hasClass("disabled") || $(this).hasClass("dialogdisabled")) { return; }
			$("div.editor").toggleClass("showtoolpanel");
		});
	});
	
	return {
		// Set the save button dirty state (also sets the editor dirty state)
		setDirty: function(dirty) {
			$(".button.savebutton").toggleClass("dirty", dirty);
			Z.editor.dirty = dirty;
		},
		
		// Set the current editor tool mode
		setEditorTool: function(tool) {
			Z.editor.tool = tool;
			
			// Add a class to the editor container to indicate which tool is selected
			$("div.editor").toggleClass("selecttool", tool == Z.editorTool.select);
			$("div.editor").toggleClass("movecameratool", tool == Z.editorTool.move);
			$("div.editor").toggleClass("tiletool", tool == Z.editorTool.tile);
			
			// Update toolbar buttons selected state
			$(".button.selectbutton").toggleClass("selected", tool == Z.editorTool.select);
			$(".button.movecamerabutton").toggleClass("selected", tool == Z.editorTool.move);
			$(".button.tilebutton").toggleClass("selected", tool == Z.editorTool.tile);
			
			// Cancel item placement if there is an item being placed
			if (Z.editor.selectToolMode == Z.editorSelectToolMode.place && Z.editor.addItem) {
				Z.editor.addItem(vec2(), true);
			}
		}
	};
}());