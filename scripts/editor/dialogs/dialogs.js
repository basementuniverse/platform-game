Z.dialogs = (function() {
	"use strict";
	
	var _dialogs = [];
	
	// Display a dialog and initialise it's data
	//	dialog:		The dialog to open and initialise
	//	callback:	An optional callback that will be added to the dialog (it will be called when
	//				the dialog is successfully closed)
	var openDialog = function(dialog, callback) {
		Z.dialogs.visibleDialog = dialog.cssClass;
		dialog.initialise();
		$("div.editor").addClass(dialog.cssClass);
		
		// Add callback to dialog if it exists
		if (callback) { dialog.successCallback = callback; }
		
		// Disable toolbar buttons
		$(".dialogdisable").addClass("dialogdisabled");
	};
	
	// Update a dialog's data and close it if the update was successful
	//	dialog:		The dialog to update and close
	//	callback:	An optional callback to call if the update/close was successful
	var closeDialog = function(dialog, callback) {
		dialog.update(function() {
			Z.dialogs.visibleDialog = null;
			$("div.editor").removeClass(dialog.cssClass);
			
			// Re-enable toolbar buttons
			$(".dialogdisable").removeClass("dialogdisabled");
			
			// Call callback if it exists
			if (callback) { callback(); }
		});
	};
	
	return {
		visibleDialog: null,
		
		// Register a dialog screen with the dialog manager
		registerDialog: function(id, dialog) {
			_dialogs[id] = dialog;
		},
		
		// Try to close any current dialog screens and display the specified dialog screen
		//	id:			The id of the dialog to show/hide/toggle
		//	show:		A boolean value to display/hide the dialog, or any other value to toggle
		//	callback:	Optional callback to pass to the dialog being opened/closed
		toggle: function(id, show, callback) {
			// If the specified dialog is currently hidden, try to display it
			if (!$("div.editor").hasClass(_dialogs[id].cssClass) && show !== false) {
				// Check for currently open dialogs
				var dialogOpen = false;
				for (var i in _dialogs) {
					if (!_dialogs.hasOwnProperty(i)) { continue; }
					if ($("div.editor").hasClass(_dialogs[i].cssClass)) {
						closeDialog(_dialogs[i], function() {
							openDialog(_dialogs[id]);
						});
						dialogOpen = true;
						break;
					}
				}
				
				// If no dialogs are open, initialise and display the specified dialog
				if (!dialogOpen) {
					openDialog(_dialogs[id], callback);
				}
			
			// If the specified dialog is currently open, try to close it after updating it
			} else if ($("div.editor").hasClass(_dialogs[id].cssClass) && show !== true) {
				closeDialog(_dialogs[id], callback);
			}
		},
		
		// Try to close all open dialogs and callback when done if successful
		closeAll: function(callback) {
			for (var i in _dialogs) {
				if (!_dialogs.hasOwnProperty(i)) { continue; }
				if ($("div.editor").hasClass(_dialogs[i].cssClass)) {
					closeDialog(_dialogs[i], callback);
					return;
				}
			}
			
			// No dialogs are open, so call callback if it exists
			if (callback) { callback(); }
		}
	};
}());