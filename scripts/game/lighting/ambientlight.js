Z.ambientLight = (function(base) {
	"use strict";
	
	// Return a list of edges with start and end vertices belonging to the specified tile that
	// are visible from the specified light direction vector
	var getEdges = function(tilePosition, lightDirection) {
		var edges = [],
			top = { start: vec2(0, 0), end: vec2(1, 0) },
			bottom = { start: vec2(0, 1), end: vec2(1, 1) },
			left = { start: vec2(0, 0), end: vec2(0, 1) },
			right = { start: vec2(1, 0), end: vec2(1, 1) };
		
		// Calculate edge vertices in world space
		top.start = vec2.mul(vec2.add(top.start, tilePosition), Z.settings.tileSize);
		top.end = vec2.mul(vec2.add(top.end, tilePosition), Z.settings.tileSize);
		bottom.start = vec2.mul(vec2.add(bottom.start, tilePosition), Z.settings.tileSize);
		bottom.end = vec2.mul(vec2.add(bottom.end, tilePosition), Z.settings.tileSize);
		left.start = vec2.mul(vec2.add(left.start, tilePosition), Z.settings.tileSize);
		left.end = vec2.mul(vec2.add(left.end, tilePosition), Z.settings.tileSize);
		right.start = vec2.mul(vec2.add(right.start, tilePosition), Z.settings.tileSize);
		right.end = vec2.mul(vec2.add(right.end, tilePosition), Z.settings.tileSize);
		
		// Otherwise only return edges that are facing the light (ignore edges that are
		// adjacent to a shadow-casting tile)
		if (
			lightDirection.Y > 0 &&
			!adjacent(tilePosition.X, tilePosition.Y - 1)
		) {
			edges.push(top);
		} else if (
			lightDirection.Y < 0 &&
			!adjacent(tilePosition.X, tilePosition.Y + 1)
		) {
			edges.push(bottom);
		}
		if (
			lightDirection.X > 0 &&
			!adjacent(tilePosition.X - 1, tilePosition.Y)
		) {
			edges.push(left);
		} else if (
			lightDirection.X < 0 &&
			!adjacent(tilePosition.X + 1, tilePosition.Y)
		) {
			edges.push(right);
		}
		return edges;
	};
	
	// Checks and adjacent tile and returns true if it is a shadow caster
	var adjacent = function(x, y) {
		var map = Z.game ? Z.game.map : Z.editor.map;
		if (x < 0 || x >= map.size.X || y < 0 || y >= map.size.Y) {
			return false;
		}
		return Z.world.tileTypes[map.tiles[y][x]].castShadow;
	};
	
	// Draw a 4-sided filled/stroked shadow onto the specified context. The shadow encloses the
	// specified edge and projects outwards to the edge of the screen
	var drawShadow = function(context, direction, edgeStart, edgeEnd) {
		var projection = vec2.mul(direction, Math.max(Z.camera.size.X, Z.camera.size.Y)),
			vertices = [
				edgeStart,
				vec2.add(edgeStart, projection),
				vec2.add(edgeEnd, projection),
				edgeEnd
			];
		
		// Draw shadow
		context.beginPath();
		context.moveTo(vertices[0].X, vertices[0].Y);
		for (var i = 1, length = vertices.length; i < length; i++) {
			context.lineTo(vertices[i].X, vertices[i].Y);
		}
		context.closePath();
		context.fill();
		context.stroke();
	};
	
	var _light = Object.create(base);
	_light.direction = vec2();
	_light.create = function(data) {
		var l = base.create.call(
				this,
				"ambient",
				data.id,
				data.brightness,
				data.colour,
				data.castShadows,
				data.active,
				data.animations
			);
		l.direction = data.direction ? vec2.norm(vec2(data.direction)) : vec2();
		l.canvas.width = Math.max(Z.camera.size.X, 1);
		l.canvas.height = Math.max(Z.camera.size.Y, 1);
		return l;
	};
	_light.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.direction = [this.direction.X, this.direction.Y];
		return data;
	};
	_light.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.direction = [0, 1];
		return data;
	};
	_light.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Direction
		properties.push({
			name: "Direction",
			id: "direction",
			type: Z.editorPropertyType.direction,
			output: Z.directionControlOutputType.array
		});
		return properties;
	};
	_light.draw = function(lightContext) {
		// Only draw light if it is active
		if (!this.active) { return; }
		
		// Resize canvas
		this.canvas.width = Math.max(Z.camera.size.X, 1);
		this.canvas.height = Math.max(Z.camera.size.Y, 1);
		
		// Fill light canvas with light colour
		this.context.save();
		this.context.globalAlpha = this.brightness;
		this.context.fillStyle = this.colour;
		this.context.fillRect(0, 0, Z.camera.size.X, Z.camera.size.Y);
		this.context.restore();
		
		// Check if this light can cast shadows and has a light direction
		if (this.castShadows && (this.direction.X || this.direction.Y)) {
			// Get all tiles currently visible on screen
			var start = vec2.div(Z.camera.bounds, Z.settings.tileSize),
				end = vec2.div(vec2.add(Z.camera.bounds, Z.camera.size), Z.settings.tileSize),
				map = Z.game ? Z.game.map : Z.editor.map,
				edges = [];
			start = vec2.map(vec2.map(start, Math.max, 0), Math.floor);
			end = vec2.map(
				vec2(Math.min(end.X, map.size.X), Math.min(end.Y, map.size.Y)),
				Math.ceil
			);
			
			// For each tile on the screen, draw a shadow from all facing edges
			this.context.save();
			this.context.translate(-Z.camera.bounds.X, -Z.camera.bounds.Y);
			this.context.fillStyle = "black";
			this.context.strokeStyle = "black";
			this.context.lineWidth = 1;
			for (var y = start.Y; y < end.Y; y++) {
				for (var x = start.X; x < end.X; x++) {
					if (Z.world.tileTypes[map.tiles[y][x]].castShadow) {
						edges = getEdges(vec2(x, y), this.direction);
						for (var i = edges.length; i--;) {
							drawShadow(
								this.context,
								this.direction,
								edges[i].start,
								edges[i].end
							);
						}
					}
				}
			}
			this.context.restore();
		}
		
		// Draw light onto the lightmap
		lightContext.save();
		lightContext.globalCompositeOperation = "screen";
		lightContext.drawImage(this.canvas, Z.camera.bounds.X, Z.camera.bounds.Y);
		lightContext.restore();
		base.draw.apply(this, arguments);
	};
	return _light;
}(Z.light));