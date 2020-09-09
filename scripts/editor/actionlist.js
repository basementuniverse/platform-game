Z.actionList = (function() {
	"use strict";
	
	var _actions = [],
		_currentAction = -1;	// Initially set to -1, meaning 'before' the first action
	
	// Update toolbar undo/redo button disabled states
	var updateToolbar = function() {
		// If there are actions in the list and there is a current action that can be undone,
		// enable the undo button and set it's title to the current action's name
		if (_actions.length > 0 && _currentAction > -1) {
			$(".button.undobutton")
			.removeClass("disabled")
			.attr("title", "Undo " + _actions[_currentAction].name);
		} else {
			$(".button.undobutton").addClass("disabled").attr("title", "");
		}
		
		// If there are actions in the list and the current action isn't the latest action (meaning
		// there are actions that can be re-done), enable the redo button and set it's title to the
		// next action's name
		if (_actions.length > 0 && _currentAction < _actions.length - 1) {
			$(".button.redobutton")
			.removeClass("disabled")
			.attr("title", "Redo " + _actions[_currentAction + 1].name);
		} else {
			$(".button.redobutton").addClass("disabled").attr("title", "");
		}
	};
	
	return {
		// Perform an undo-able action and add it to the actions list
		//	name:			The name of the action
		//	action:			A function that performs the action
		//	undo:			A function that undoes the action
		//	skipPerform:	If this is true, the action won't be performed automatically (an action
		//					will still be added to the list however)
		performAction: function(name, action, undo, skipPerform) {
			// If user has undone actions and a new action is performed, remove subsequent actions
			// (ie. start a new 'action thread', undone actions are lost and can't be re-done)
			if (_currentAction < _actions.length - 1) {
				_actions.splice(_currentAction + 1, _actions.length);
			}
			
			// Perform action (unless skipPerform is true) and add the action to the list
			if (!skipPerform) {
				action();
			}
			_actions.push({
				name: name,
				action: action,
				undo: undo
			});
			_currentAction = _actions.length - 1;
			updateToolbar();
			
			// Notify the editor that changes have been made
			Z.toolbar.setDirty(true);
		},
		
		// Call the undo function of the most recent action if available
		undo: function() {
			var action = _actions[_currentAction--];
			if (action.undo) { action.undo(); }
			updateToolbar();
		},
		
		// Redo the last undone action if available
		redo: function() {
			_actions[++_currentAction].action();
			updateToolbar();
		},
		
		// Removes all actions and resets the current action pointer
		invalidate: function() {
			_actions = [];
			_currentAction = -1;
			updateToolbar();
		}
	};
}());