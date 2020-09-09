Z.prompt = (function() {
	"use strict";
	
	// Create and return a button element
	var button = function(text, cssClass, callback, close) {
		var button = $("<a href='javascript:void(0)' class='button'>")
				.text(text)
				.addClass(cssClass)
				.click(function() {
					close();
					if (callback) { callback(); }
				});
		return button;
	};
	
	return {
		// Display a prompt on the screen containing the specified message
		//	message:	The message to display (can contain HTML)
		//	buttons:	An array of buttons with the following properties:
		//				text:		The button label
		//				cssClass:	Optional CSS class to add to the button element
		//				callback:	A function to call when the button is clicked
		show: function(message, buttons) {
			var prompt = $("<div class='prompt fadein'>"),
				close = function() {	// Closes prompt
					prompt.removeClass("show");
					setTimeout(function() { prompt.remove(); }, 1000);
				};
			
			// Create message element
			var message = $("<div class='message'>").html(message).appendTo(prompt);
			
			// Add buttons
			var buttonsContainer = $("<div class='buttons'>").appendTo(message);
			if (!buttons || buttons.length < 1) {	// If there are no buttons, add default button
				buttonsContainer.append(button("Close", "cancelbutton", null, close));
			} else {
				for (var i = 0, length = buttons.length; i < length; i++) {
					buttonsContainer.append(button(
						buttons[i].text,
						buttons[i].cssClass,
						buttons[i].callback,
						close
					));
				}
			}
			
			// Append prompt to document body
			$("body").append(prompt);
			
			// Chrome doesn't always reflow properly, so use this roundabout method to fade in/out
			setTimeout(function() {
				prompt.addClass("show");
			}, 100);
		}
	};
}());