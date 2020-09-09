Z.musicTrigger = (function(base) {
	"use strict";
	
	var _music = Object.create(base);
	_music.musicId = "";
	_music.transition = false;
	_music.create = function(data) {
		var m = base.create.call(this, data.id, vec2(data.position), data.inputs);
		m.type = "music";
		m.musicId = data.musicId || "";
		m.transition = !!data.transition;
		return m;
	};
	_music.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.musicId = this.musicId;
		data.transition = this.transition;
		return data;
	};
	_music.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.musicId = "";
		data.transition = false;
		return data;
	};
	_music.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Music id
		var tracks = [];
		for (var i in Z.music.tracks) {
			if (Z.music.tracks.hasOwnProperty(i)) {
				tracks.push({
					label: Z.music.tracks[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Music",
			id: "musicId",
			type: Z.editorPropertyType.select,
			options: tracks
		});
		
		// Transition
		properties.push({
			name: "Transition",
			id: "transition",
			type: Z.editorPropertyType.toggle,
			labelOn: "Fade",
			labelOff: "Instant"
		});
		return properties;
	};
	_music.setState = function(activated) {
		// Start music track when changing from deactivated to activated
		if (!this.activated && activated) {
			Z.music.play(this.musicId, this.transition);
		}
		base.setState.apply(this, arguments);
	};
	return _music;
}(Z.entity));