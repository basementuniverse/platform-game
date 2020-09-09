Z.loginDialog = (function() {
	"use strict";
	
	// Initialise dialog buttons when document has loaded
	$(document).ready(function() {
		// Close button logs the user in and closes the dialog
		$(".dialog.login .closebutton").click(function() {
			Z.dialogs.toggle("login", false);
		});
		
		// Reset button closes the dialog without logging in
		$(".dialog.login .resetbutton").click(function() {
			Z.dialogs.visibleDialog = null;
			$("div.editor").removeClass(Z.loginDialog.cssClass);
			
			// Re-enable toolbar buttons
			$(".dialogdisable").removeClass("dialogdisabled");
		});
		
		// Log the user in and close the dialog if the enter key is pressed while either the
		// username or password input is focussed
		$("#username, #password").keypress(function(e) {
			if (e.keyCode == Keys.Enter) {
				Z.dialogs.toggle("login", false);
			}
		});
	});
	
	// Add an error message to the dialog
	var addError = function(message) {
		$("<div class='error'>").text(message).appendTo(".dialog.login .errors");
	};
	
	var _loginDialog = {
		successCallback: null,		// An optional function to call when the dialog is
									// successfully closed
		cssClass: "showlogin",		// The CSS classname to add to the document body in order
									// to display this dialog screen
		// Initialise the login dialog fields
		initialise: function() {
			$("#username").val("");
			$("#password").val("");
		},
		
		// Try to log the current user in
		//	callback:	A function to call when finished logging the user in, this function should
		//				close the dialog (this function won't be called if any errors occur)
		update: function(callback) {
			var username = $("#username").val(),
				password = $("#password").val(),
				success = true;
			
			// Remove all current error messages
			$(".dialog.login .error").remove();
			
			// Make sure a username has been entered
			if (!username) {
				addError("User name must not be empty.");
				success = false;
			}
			
			// Try to log user in and close the dialog if successful, otherwise display a message
			if (success) {
				Z.editor.login(
					username,
					password, 
					function() {
						if (Z.loginDialog.successCallback) { Z.loginDialog.successCallback(); }
						callback();
					},
					function() {
						addError("Username or password is incorrect!");
					}
				);
			}
		}
	};
	
	// Register dialog
	Z.dialogs.registerDialog("login", _loginDialog);
	
	return _loginDialog;
}());