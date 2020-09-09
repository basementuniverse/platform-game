Z.stateManager = (function() {
	"use strict";
	
	return {
		states: [],
		
		// Add a state to the stack
		push: function(state) {
			if (state.initialise) {	// Initialise state if function exists
				state.initialise();
			}
			this.states.push(state);
			
			// Start state transition-in
			state.state.transitionType = Z.stateTransition.transitionIn;
			state.state.transitionAmount = 0;
		},
		
		// Remove the top-most state from the stack and return it
		pop: function() {
			if (this.states.length) {
				var last = this.states.length - 1,
					state = null;
				
				// Remove the top-most state that isn't currently transitioning out
				while (
					last >= 0 &&
					this.states[last].state.transitionType == Z.stateTransition.transitionOut
				) {
					last--;
				}
				if (last >= 0) {
					state = this.states[last].state;
					
					// Start state transition-out
					state.transitionType = Z.stateTransition.transitionOut;
					state.transitionAmount = 0;
					
					// Return state
					return this.states[last];
				}
			}
		},
		
		// Remove all states
		clear: function() {
			if (this.states.length) {
				for (var i = this.states.length; i--;) {
					if (this.states[i].state.transitionType != Z.stateTransition.transitionOut) {
						this.states[i].state.transitionType = Z.stateTransition.transitionOut;
						this.states[i].state.transitionAmount = 0;
					}
				}
			}
		},
		update: function(elapsedTime) {
			if (this.states.length) {
				// Only update the top-most state that isn't currently transitioning out
				for (var i = this.states.length; i--;) {
					if (this.states[i].state.transitionType != Z.stateTransition.transitionOut) {
						this.states[i].update(elapsedTime);
						break;
					}
				}
				
				// Update all state transitions
				var state = null,
					amount = 0;
				for (var i = this.states.length; i--;) {
					state = this.states[i].state;
					
					// Use default transition time unless this state has defined one
					if (state.transitionTime === undefined) {
						amount = elapsedTime / Z.settings.stateTransitionTime;
					} else {
						amount = elapsedTime / state.transitionTime;
					}
					if (state.transitionAmount < 1) {
						state.transitionAmount = Math.clamp(state.transitionAmount + amount);
					
					// If any states have finished transitioning out, remove them
					} else if (state.transitionType == Z.stateTransition.transitionOut) {
						if (this.states[i].dispose) {	// Dispose state if function exists
							this.states[i].dispose();
						}
						this.states.splice(i, 1);
					}
				}
			}
		},
		draw: function(context, width, height) {
			if (this.states.length) {
				var state = this.states[this.states.length - 1],
					drawStates = [state],
					transparentStateIndex = this.states.length - 1;
				
				// Create a list of states that need to be drawn (transparent states also display
				// the state underneath them in the stack)
				while (
					transparentStateIndex > 0 &&
					this.states[transparentStateIndex].state.transparent
				) {
					drawStates.push(this.states[--transparentStateIndex]);
				}
				
				// Draw states (in reverse order ie. bottom to top)
				for (var i = drawStates.length; i--;) {
					drawStates[i].draw(context, width, height);
				}
			}
		}
	};
}());