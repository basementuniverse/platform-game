Z.pointLight = (function(base) {
	"use strict";
	
	// Return a list of edges with start and end vertices belonging to the specified tile that
	// are visible from the specified light position
	var getEdges = function(tilePosition, lightPosition) {
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
		
		// If light is inside a tile, return all edges
		if (
			lightPosition.Y >= top.start.Y &&
			lightPosition.Y <= bottom.start.Y &&
			lightPosition.X >= left.start.X &&
			lightPosition.X <= right.start.X
		) {
			return [top, bottom, left, right];
		}
		
		// Otherwise only return edges that are facing the light (ignore edges that are
		// adjacent to a shadow-casting tile)
		if (
			lightPosition.Y < top.start.Y && 
			!adjacent(tilePosition.X, tilePosition.Y - 1)
		) {
			edges.push(top);
		} else if (
			lightPosition.Y > bottom.start.Y &&
			!adjacent(tilePosition.X, tilePosition.Y + 1)
		) {
			edges.push(bottom);
		}
		if (
			lightPosition.X < left.start.X &&
			!adjacent(tilePosition.X - 1, tilePosition.Y)
		) {
			edges.push(left);
		} else if (
			lightPosition.X > right.start.X &&
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
	
	// Draw a 6-sided filled/stroked shadow onto the specified context. The shadow encloses the
	// specified edge and projects outwards to the light size, with an extra section to prevent
	// light bleeding when lights are close to the shadow casting tile
	var drawShadow = function(context, position, size, edgeStart, edgeEnd) {
		// Project start and end positions past the edge vertices
		var projectedStart = vec2.add(
				position,
				vec2.mul(vec2.norm(vec2.sub(edgeStart, position)), size)
			),
			projectedEnd = vec2.add(
				position,
				vec2.mul(vec2.norm(vec2.sub(edgeEnd, position)), size)
			),
			projectedAverage = vec2.div(vec2.add(projectedStart, projectedEnd), 2);
		
		// Get a vector pointing in the direction of the tile center from the light position which
		// is long enough to cover the light size
		projectedAverage = vec2.mul(vec2.norm(vec2.sub(projectedAverage, position)), size);
		
		// Set shadow path vertices
		var vertices = [
				edgeStart,
				projectedStart,
				vec2.add(projectedStart, projectedAverage),
				vec2.add(projectedEnd, projectedAverage),
				projectedEnd,
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
	_light.position = vec2();
	_light.size = 0;
	_light.actorId = "";
	_light.create = function(data) {
		var l = base.create.call(
				this,
				"point",
				data.id,
				data.brightness,
				data.colour,
				data.castShadows,
				data.active,
				data.animations
			);
		l.position = vec2(data.position);
		l.size = data.size || 0;
		l.actorId = data.actorId || "";
		l.canvas.width = l.size * 2;
		l.canvas.height = l.size * 2;
		return l;
	};
	_light.getData = function() {
		var data = base.getData.apply(this, arguments);
		data.position = [this.position.X, this.position.Y];
		data.size = this.size;
		data.actorId = this.actorId;
		return data;
	};
	_light.getEmptyData = function(id, type, position) {
		var data = base.getEmptyData.apply(this, arguments);
		data.position = position;
		data.size = 100;
		data.actorId = "";
		return data;
	};
	_light.getEditorProperties = function() {
		var properties = base.getEditorProperties.apply(this, arguments);
		
		// Size
		properties.push({
			name: "Size",
			id: "size",
			type: Z.editorPropertyType.number,
			min: 10,
			max: 200,
			round: true
		});
		
		// Actor id
		properties.push({
			name: "Actor",
			id: "actorId",
			type: Z.editorPropertyType.connect,
			typeFilter: [
				"block",
				"character",
				"decoration",
				"door",
				"platform",
				"player"
			]
		});
		return properties;
	};
	_light.draw = function(lightContext) {
		// Only draw light if it is active
		if (!this.active) { return; }
		
		// If this light is attached to an actor, fix the light's position to the center of the
		// target actor
		var map = Z.game ? Z.game.map : Z.editor.map,
			actor = null;
		if (this.actorId && (actor = map.actorsById[this.actorId])) {
			this.position = vec2.add(actor.position, vec2.div(actor.size, 2));
		}
		
		// If using the editor and this light is attached to the player, attach it to the player
		// starting position instead
		if (Z.editor && this.actorId == "player") {
			this.position = vec2.add(
				map.entitiesById["playerstart"].position,
				vec2.div(map.entitiesById["playerstart"].size, 2)
			);
		}
		
		// Truncate position to prevent shadows from jittering
		this.position = vec2.map(this.position, Math.floor);
		
		// Resize canvas
		this.canvas.width = this.size * 2;
		this.canvas.height = this.size * 2;
		
		// Fill light canvas with black
		this.context.save();
		this.context.fillStyle = "black";
		this.context.fillRect(0, 0, this.size * 2, this.size * 2);
		
		// Draw light gradient
		this.context.globalAlpha = this.brightness;
		this.context.translate(this.size, this.size);
		var gradient = this.context.createRadialGradient(0, 0, 0, 0, 0, this.size);
		gradient.addColorStop(0, this.colour);
		gradient.addColorStop(1, "black");
		this.context.fillStyle = gradient;
		this.context.beginPath();
		this.context.arc(0, 0, this.size, 0, Math.PI * 2, false);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
		
		// Check if this light can cast shadows
		if (this.castShadows) {
			// Get all tiles inside the light bounding box
			var start = vec2.div(vec2.sub(this.position, this.size), Z.settings.tileSize),
				end = vec2.div(vec2.add(this.position, this.size), Z.settings.tileSize),
				edges = [];
			start = vec2.map(vec2.map(start, Math.max, 0), Math.floor);
			end = vec2.map(
				vec2(Math.min(end.X, map.size.X), Math.min(end.Y, map.size.Y)),
				Math.ceil
			);
			
			// For each tile in the light's bounding box, draw a shadow from all facing edges
			this.context.save();
			this.context.fillStyle = "black";
			this.context.strokeStyle = "black";
			this.context.lineWidth = 1;
			this.context.translate(-this.position.X + this.size, -this.position.Y + this.size);
			for (var y = start.Y; y < end.Y; y++) {
				for (var x = start.X; x < end.X; x++) {
					if (Z.world.tileTypes[map.tiles[y][x]].castShadow) {
						edges = getEdges(vec2(x, y), this.position);
						for (var i = edges.length; i--;) {
							drawShadow(
								this.context,
								this.position,
								this.size,
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
		lightContext.drawImage(
			this.canvas,
			this.position.X - this.size,
			this.position.Y - this.size
		);
		lightContext.restore();
		base.draw.apply(this, arguments);
	};
	return _light;
}(Z.light));