Z.playerStartMarker = (function(base) {
	"use strict";
	
	var _playerStartMarker = Object.create(base);
	_playerStartMarker.sprite = null;
	_playerStartMarker.size = vec2();
	_playerStartMarker.create = function(position) {
		var p = base.create.call(this, "playerstart", position);
		p.type = "playerstart";
		
		// Initialise player sprite
		var data = Z.content.items["player"];
		p.sprite = Z.sprite.create(data.spriteData);
		p.size = vec2(data.size);
		return p;
	};
	_playerStartMarker.handleDrag = function(selection) {
		Z.entity.handleDrag.apply(this, arguments);
		Z.editor.map.playerStartingPosition = vec2(this.position);
	};
	_playerStartMarker.handleMove = function(moveVector) {
		Z.entity.handleMove.apply(this, arguments);
		Z.editor.map.playerStartingPosition = vec2(this.position);
	};
	_playerStartMarker.draw = function(context) {
		this.sprite.draw(context, this.position, vec2(1, 0));
	};
	return _playerStartMarker;
}(Z.entity));