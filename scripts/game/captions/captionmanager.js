Z.captionManager = (function() {
	"use strict";
	
	var DEFAULT_TIMEOUT = 3,
		TIMEOUT_PER_CHARACTER = 0.06;
	
	var _captions = [];
	
	return {
		initialise: function() {
			_captions = [];
		},
		add: function(message, actorId, timeout, colour, backgroundColour) {
			var id = "",
				caption = null;
			
			// Calculate timeout
			if (!timeout) {
				timeout = DEFAULT_TIMEOUT + (message.length * TIMEOUT_PER_CHARACTER);
			}
			
			// If an actor is specified, create an actor caption otherwise create a screen caption
			if (actorId) {
				id = actorId;
				caption = Z.actorCaption.create(message, timeout, colour, backgroundColour);
			} else {
				id = "screen";
				caption = Z.screenCaption.create(message, timeout, colour, backgroundColour);
			}
			_captions[id] = caption;
		},
		update: function(elapsedTime) {
			var expired = [];
			for (var i in _captions) {
				if (_captions.hasOwnProperty(i)) {
					_captions[i].update(elapsedTime);
					
					// Make a list of captions that have timed-out this frame
					if (_captions[i].timeout <= 0) {
						expired.push(i);
					}
				}
			}
			
			// Remove timed-out captions
			for (var i = expired.length; i--;) {
				delete _captions[expired[i]];
			}
		},
		draw: function(context) {
			// Draw screen caption
			if (_captions["screen"]) {
				_captions["screen"].draw(
					context,
					Z.camera.bounds
				);
			}
			
			// Draw actor captions
			for (var i in _captions) {
				if (!_captions.hasOwnProperty(i) || i == "screen") { continue; }
				
				// Get actor position and draw caption centered on the actor's x-position
				if (Z.game.map.actorsById[i]) {
					_captions[i].draw(
						context,
						vec2.add(
							Z.game.map.actorsById[i].position,
							vec2(Z.game.map.actorsById[i].size.X / 2, 0)
						)
					);
				}
			}
		}
	};
}());