Z.collision = (function() {
	"use strict";
	
	var TILE_BUFFER_AREA = 2,	// Check tiles within actor's area plus this number of tiles
		LADDER_OVERLAP = 5,		// Actors must overlap ladder tiles by this amount on the x-axis
		LIQUID_OVERLAP = 10;	// Actors must overlap liquid tiles by this amount on the y-axis
	
	// Return the collision box for actor a (including velocity projection if actor has velocity)
	var getCollisionBox = function(a) {
		var p = a.position,
			s = a.size,
			v = a.velocity || vec2();
		return {
			tl: vec2(Math.min(p.X, p.X + v.X), Math.min(p.Y, p.Y + v.Y)),
			br: vec2(Math.max(p.X + s.X, p.X + s.X + v.X), Math.max(p.Y + s.Y, p.Y + s.Y + v.Y))
		};
	};
	
	// Check if a and b overlap and return the interval amounts, or false if there is no overlap
	var getCollisionIntervals = function(a, b) {
		var interval = vec2(
			a.tl.X < b.tl.X ? b.tl.X - a.br.X : a.tl.X - b.br.X,
			a.tl.Y < b.tl.Y ? b.tl.Y - a.br.Y : a.tl.Y - b.br.Y
		);
		
		// If both axis overlap (ie. have negative interval) then objects are colliding
		return (interval.X <= 0 && interval.Y <= 0) ? interval : false;
	};
	
	return {
		// Check if actors a and b are colliding and return an anonymous function to resolve the
		// collision if they are overlapping
		checkActors: function(a, b) {
			// Skip check if either actor doesn't collide with other actors
			if (!a.collideActors || !b.collideActors) { return; }
			var aBox = getCollisionBox(a),
				bBox = getCollisionBox(b),
				interval = getCollisionIntervals(aBox, bBox);
			if (interval) {
				interval = vec2.map(interval, Math.abs);
				if (interval.X < interval.Y) {
					interval = vec2(aBox.tl.X < bBox.tl.X ? interval.X : -interval.X, 0);
				} else {
					interval = vec2(0, aBox.tl.Y < bBox.tl.Y ? interval.Y : -interval.Y);
					
					// Check if one actor is standing on top of the other
					if (a.resolveCollisions && b.resolveCollisions) {
						if (aBox.tl.Y < bBox.tl.Y) {
							a.falling = false;
							a.position.Y = b.position.Y - a.size.Y;
							
							// Only gravity-enabled actors can stand on other actors
							if (a.useGravity) {
								b.standingActors.push(a);
							}
						} else if (aBox.tl.Y >= bBox.tl.Y) {
							b.falling = false;
							b.position.Y = a.position.Y - b.size.Y;
							if (b.useGravity) {
								a.standingActors.push(b);
							}
						}
					}
				}
				
				// Return anonymous function for handling collision
				return function() {
					a.handleCollision(b, interval);
					b.handleCollision(a, vec2.mul(interval, -1));
				};
			}
		},
		
		// Return true if actor a and entity b are overlapping
		checkActorEntity: function(a, b) {
			var aBox = getCollisionBox(a),
				bBox = getCollisionBox(b),
				interval = getCollisionIntervals(aBox, bBox);
			return !!interval;
		},
		
		// Check if an actor is colliding with any tiles and update the actor's velocity if it is
		//	a:		The actor to check
		//	map:	A reference to the current map
		checkTiles: function(a, map) {
			if (!a.collideTiles) { return; }	// Skip check if actor doesn't collide with tiles
			var aBox = getCollisionBox(a),
				aTileBox = {	// Get tile area overlapping the collision box (plus buffer area to
								// account for displacement when object collides with a tile)
					tl: vec2.sub(
						vec2.map(vec2.div(aBox.tl, Z.settings.tileSize), Math.floor),
						TILE_BUFFER_AREA
					),
					br: vec2.add(
						vec2.map(vec2.div(aBox.br, Z.settings.tileSize), Math.ceil),
						TILE_BUFFER_AREA
					)
				},
				tBox = null,
				interval = null,
				translation = null,
				translateX = false,
				tile = null,
				tileType = null,
				hasTop = false,		// Current tile has a top edge
				hasBottom = false,	// Current tile has a bottom edge
				hasLeft = false,	// Current tile has a left edge
				hasRight = false;	// Current tile has a right edge
			
			// Checks an adjacent tile and returns true if it is solid
			var adjacent = function(x, y) {
				if (x < 0 || x >= map.size.X || y < 0 || y >= map.size.Y) {
					return false;
				}
				return Z.world.tileTypes[map.tiles[y][x]].solid;
			};
			
			// Check each tile in the area covered by the collision box (only check inside the map)
			for (var y = Math.max(0, aTileBox.tl.Y),
					height = Math.min(map.size.Y, aTileBox.br.Y); y < height; y++) {
				for (var x = Math.max(0, aTileBox.tl.X),
						width = Math.min(map.size.X, aTileBox.br.X); x < width; x++) {
					// Get the tile type definition for the current tile
					tileType = Z.world.tileTypes[map.tiles[y][x]];
					
					// Skip this tile if it's non-solid, has no collideable edges and isn't either
					// a ladder or liquid tile (ladder and liquid tiles are handled later below)
					if (!tileType.solid &&
						!tileType.topEdge && !tileType.bottomEdge &&
						!tileType.leftEdge && !tileType.rightEdge &&
						!tileType.ladder && !tileType.liquid) {
						continue;
					}
					
					// Get collision box again (previous tile collisions will have modified actor
					// velocity so collision box will have also changed)
					aBox = getCollisionBox(a);
					
					// Get collision box for the current tile
					tBox = {
						tl: vec2.mul(vec2(x, y), Z.settings.tileSize),
						br: vec2.mul(vec2.add(vec2(x, y), 1), Z.settings.tileSize)
					};
					
					// Check if actor and tile are colliding
					if (interval = getCollisionIntervals(aBox, tBox)) {
						interval = vec2.map(interval, Math.abs);
						translation = null;
						
						// Check for intervals less than 1 pixel (prevents getting stuck on corners)
						if (interval.X < 1 && interval.Y < 1) { continue; }
						
						// If this tile is a ladder tile and the actor is overlapping by a certain
						// amount on the x-axis, notify the actor but don't check collisions (ladder
						// tiles are intrinsically non-collideable)
						if (tileType.ladder && interval.X >= LADDER_OVERLAP) {
							a.onLadder = true;
							continue;
						}
						
						// If this tile is a liquid tile, notify the actor but don't check
						// collisions (liquid tiles are non-collideable, like ladder tiles)
						if (tileType.liquid) {
							if (interval.Y >= LIQUID_OVERLAP) {
								a.inLiquid = true;
							}
							
							// Check if actor is near a liquid surface (ie. overlapping a liquid
							// tile that is below the actor and the tile above isn't liquid)
							if (
								tBox.tl.Y > a.position.Y &&
								(y <= 0 || !Z.world.tileTypes[map.tiles[y - 1][x]].liquid)
							) {
								a.onLiquidSurface = true;
							}
							continue;
						}
						
						// By default, only separate actor on the axis with the smallest interval
						// (ie. minimum translation vector)
						translateX = interval.X < interval.Y;
						
						// Simple check for fast moving objects (if actor is moving more than the
						// actor's size in any dimension, force actor to separate on the fastest
						// moving axis - this prevents the actor from passing through thin tiles)
						if (Math.abs(a.velocity.Y) > a.size.Y) {
							translateX = false;
						} else if (Math.abs(a.velocity.X) > a.size.X) {
							translateX = true;
						}
						
						// Translate object opposite to direction of movement in selected axis
						if (translateX) {
							translation = vec2(a.velocity.X > 0 ? interval.X : -interval.X, 0);
						} else {
							translation = vec2(0, a.velocity.Y > 0 ? interval.Y : -interval.Y);
						}
						
						// If this is a solid tile, check adjacent tiles to see which edges should
						// be separated on, otherwise check which edges are solid for this tile type
						hasTop = tileType.solid ? !adjacent(x, y - 1) : tileType.topEdge;
						hasBottom = tileType.solid ? !adjacent(x, y + 1) : tileType.bottomEdge;
						hasLeft = tileType.solid ? !adjacent(x - 1, y) : tileType.leftEdge;
						hasRight = tileType.solid ? !adjacent(x + 1, y) : tileType.rightEdge;
						
						// Only separate actor on solid edges if the actor's velocity will move the
						// actor through that edge this frame
						if (hasTop &&		// Top edge
							(a.position.Y + a.size.Y) <= tBox.tl.Y && aBox.br.Y >= tBox.tl.Y) {
							a.falling = false;	// Only top edges are standable
							a.velocity.Y -= interval.Y;
							
							// Set the surface type that the actor is currently standing on - this
							// only gets set if the actor overlaps at least halfway or if the
							// standing surface type hasn't already been set. This means the actor
							// will be standing on whichever surface they overlap the most.
							if (!a.standingSurface || tBox.tl.X < (a.position.X + a.size.X / 2)) {
								a.standingSurface = tileType;
							}
						}
						if (hasBottom &&	// Bottom edge
							a.position.Y >= tBox.br.Y && aBox.tl.Y <= tBox.br.Y) {
							a.velocity.Y += interval.Y;
						}
						if (hasLeft &&		// Left edge
							(a.position.X + a.size.X) <= tBox.tl.X && aBox.br.X >= tBox.tl.X) {
							a.velocity.X -= interval.X;
						}
						if (hasRight &&		// Right edge
							a.position.X >= tBox.br.X && aBox.tl.X <= tBox.br.X) {
							a.velocity.X += interval.X;
						}
						
						// Handle tile collision
						a.handleTileCollision(vec2(x, y), tileType);
					}
				}
			}
		},
		
		// Return true if the specified point is inside any tile in the map that passes the check
		// callback (if this is null, test for solid tiles instead)
		//	p:		The point to check (vec2)
		//	map:	The current map
		//	check:	A function that should take a tile type as it's only argument and returns true
		//			if the tile type counts as a collision
		checkPoint: function(p, map, check) {
			// Get the tile position of the point
			var t = vec2.map(vec2.div(p, Z.settings.tileSize), Math.floor);
			return this.checkTile(t, map, check);
		},
		
		// Return true if the specified tile passes the check callback (if this is null, test for
		// a solid tile instead)
		checkTile: function(t, map, check) {
			if (t.X >= 0 && t.X < map.size.X && t.Y >= 0 && t.Y < map.size.Y) {
				var tileType = Z.world.tileTypes[map.tiles[t.Y][t.X]];
				return check ? check(tileType) : tileType.solid;
			}
			return false;
		},
		
		// Return true if the line from p1 to p2 intersects any solid tiles or tile edges. The line
		// must be horizontal (p1.Y == p2.Y) or vertical (p1.X == p2.X), and will be snapped to the
		// closest axis if it isn't
		checkLine: function(p1, p2, map) {
			p1 = vec2(p1);	// Copy p1 and p2 to make sure arguments are immutable
			p2 = vec2(p2);
			
			// Snap line to nearest axis if it isn't horizontal or vertical
			if (p1.X != p2.X && p1.Y != p2.Y) {
				var xDiff = Math.abs(p1.X - p2.X),
					yDiff = Math.abs(p1.Y - p2.Y);
				if (xDiff > yDiff) {
					p2.Y = p1.Y;
				} else {
					p2.X = p1.X;
				}
			}
			
			// Get the tile position of the line start and end points
			var t1 = vec2.map(vec2.div(p1, Z.settings.tileSize), Math.floor),
				t2 = vec2.map(vec2.div(p2, Z.settings.tileSize), Math.floor);
			
			// If t1 == t2, return false (assume no tile intersection)
			if (vec2.eq(t1, t2)) { return false; }
			
			// Check if the line is horizontal or vertical and get the line direction (for
			// iterating over tiles) and collideable edge
			var edge = "",
				direction = "",
				horizontal = t1.Y == t2.Y;
			
			// Create a function to check for tile edges depending on the line direction (p1 -> p2)
			if (t1.X > t2.X) { edge = "rightEdge";	direction = -1; }
			if (t1.X < t2.X) { edge = "leftEdge";	direction = 1; }
			if (t1.Y > t2.Y) { edge = "bottomEdge";	direction = -1; }
			if (t1.Y < t2.Y) { edge = "topEdge";	direction = 1; }
			var check = function(t) { return t.solid || t[edge]; };
			
			// Check tiles between the start and end points
			var current = horizontal ? t1.X : t1.Y,
				diff = horizontal ? Math.abs(t1.X - t2.X) : Math.abs(t1.Y - t2.Y);
			for (var i = 0; i < diff; i++, current += direction) {
				if (this.checkTile(
					vec2(horizontal ? current : t1.X, horizontal ? t1.Y : current),
					Z.game.map,
					check
				)) {
					return true;
				}
			}
			return false;
		}
	};
}());