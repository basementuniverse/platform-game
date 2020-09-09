Z.soundTrigger = (function(base) {
	"use strict";
	
	var _sound = Object.create(base);
	_sound.soundId = "";
	_sound.volume = 0;
	_sound.pan = 0;
	_sound.create = function(data) {
		var s = base.create.call(this, data.id, vec2(data.position), data.inputs);
		s.type = "sound";
		s.soundId = data.soundId || "";
		s.volume = data.volume || 0;
		s.pan = data.pan || 0;
		return s;
	};
	_sound.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.soundId = this.soundId;
		data.volume = this.volume;
		data.pan = this.pan;
		return data;
	};
	_sound.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.soundId = "";
		data.volume = 0;
		data.pan = 0;
		return data;
	};
	_sound.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Sound id
		var sounds = [];
		for (var i in Z.sounds.sounds) {
			if (Z.sounds.sounds.hasOwnProperty(i)) {
				sounds.push({
					label: Z.sounds.sounds[i].name,
					value: i
				});
			}
		}
		properties.push({
			name: "Sound",
			id: "soundId",
			type: Z.editorPropertyType.select,
			options: sounds
		});
		
		// Volume
		properties.push({
			name: "Volume",
			id: "volume",
			type: Z.editorPropertyType.number,
			min: 0,
			max: 1
		});
		
		// Pan
		properties.push({
			name: "Pan",
			id: "pan",
			type: Z.editorPropertyType.number,
			min: -1,
			max: 1
		});
		return properties;
	};
	_sound.setState = function(activated) {
		// Play sound when changing from deactivated to activated
		if (!this.activated && activated) {
			Z.sound.play(this.soundId, this.volume, this.pan);
		}
		base.setState.apply(this, arguments);
	};
	return _sound;
}(Z.entity));