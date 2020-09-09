Z.game = (function() {
	"use strict";
	
	// Restart the game at the beginning of the current map
	var restart = function(currentMapId) {
		// Dispose and rebuild current map (even if it is persistent)
		Z.game.map.dispose();
		Z.game.map = Z.map.create(Z.world, currentMapId, Z.world.maps[currentMapId]);
		
		// Reinitialise player at map starting position and re-link camera
		Z.player.initialise(Z.game.map.playerStartingPosition);
		Z.camera.initialise(Z.player, true);
		
		// Add player to beginning of map actors lists
		Z.game.map.actors.unshift(Z.player);
		Z.game.map.actorsById[Z.player.id] = Z.player;
		
		// Reinitialise caption manager
		Z.captionManager.initialise();
	};
	
	return {
		state: {
			transparent: true,
			transitionType: Z.stateTransition.transitionIn,
			transitionAmount: 0
		},
		map: null,					// The current map being played
		restarting: false,			// True if the game should be restarted before the next frame
		persistentMapBuffer: [],	// List of persistent map states indexed by id
		globalFlags: [],			// List of global flag states indexed by id
		initialise: function() {
			// Initialise world
			Z.world.initialise();
			
			// Set the browser title bar to the world's name
			document.title = Z.world.name;
			
			// Create starting map
			if (!Z.world.startingMap || !Z.world.maps[Z.world.startingMap]) {
				Z.stateManager.pop();
				Z.stateManager.push(Z.message.create("Couldn't start game!", Z.messageType.error));
				return;
			}
			this.map = Z.map.create(
				Z.world,
				Z.world.startingMap,
				Z.world.maps[Z.world.startingMap]
			);
			
			// Initialise player properties and link camera to player position
			Z.player.initialise(this.map.playerStartingPosition);
			Z.camera.initialise(Z.player, true);
			
			// Add player to beginning of map actors lists
			this.map.actors.unshift(Z.player);
			this.map.actorsById[Z.player.id] = Z.player;
			
			// Initialise game systems
			Z.hud.initialise();
			Z.captionManager.initialise();
		},
		dispose: function() {
			// Dispose and clear reference to current map
			this.map.dispose();
			this.map = null;
			
			// Dispose world
			Z.world.dispose();
			
			// Dispose player
			Z.player.dispose();
		},
		restart: function() {
			this.restarting = true;
		},
		changeMap: function(mapId, targetId) {
			// Push map transition state (for fade out/fade in effect)
			Z.stateManager.push(Z.mapTransition.create(function() {
				var changeMap = (mapId && mapId != Z.game.map.id);
				if (changeMap) {
					// Make sure the new map exists
					if (!Z.world.maps[mapId]) {
						console.warn("Map (%s) doesn't exist.", mapId);
						Z.stateManager.push(Z.message.create(
							"Couldn't transition to map!",
							Z.messageType.error
						));
						return;
					}
						
					// Store current map in buffer if it is persistent
					if (Z.game.map.persistent) {
						Z.game.persistentMapBuffer[Z.game.map.id] = Z.game.map;
						
						// Remove player from current map's actors lists
						Z.game.map.actors.shift();
						Z.game.map.actorsById[Z.player.id] = null;
					} else {	// Otherwise dispose and clear actors/entities
						Z.game.map.dispose();
					}
					
					// Get map from the buffer if it is persistent and has already been created,
					// otherwise create a new map
					Z.game.map = Z.game.persistentMapBuffer[mapId] || Z.map.create(
						Z.world,
						mapId,
						Z.world.maps[mapId]
					);
					
					// Add player to new map's actors lists
					Z.game.map.actors.unshift(Z.player);
					Z.game.map.actorsById[Z.player.id] = Z.player;
					
					// Reinitialise caption manager
					Z.captionManager.initialise();
				}
				
				// Position player at starting position or marker position
				if (targetId && Z.game.map.entitiesById[targetId]) {
					Z.player.position = vec2(Z.game.map.entitiesById[targetId].position);
				} else {
					Z.player.position = vec2(Z.game.map.playerStartingPosition);
				}
				
				// Reinitialise camera at new player position
				Z.camera.initialise(Z.player, changeMap);
			}));
		},
		handleInput: function() {
			if (Z.input.keyPressed(Keys.Escape)) {
				Z.stateManager.push(Z.pauseMenu);
			}
			Z.player.handleInput();
		},
		update: function(elapsedTime) {
			if (!this.map) { return; }
			
			// Check if the game is restarting before updating (this ensures that game data/assets
			// don't get disposed/reinitialised halfway through map/actor update)
			if (this.restarting) {
				restart(this.map.id);
				this.restarting = false;
			} else {
				this.handleInput();
				this.map.update(elapsedTime);
				Z.captionManager.update(elapsedTime);
			}
			Z.hud.update(elapsedTime);
		},
		draw: function(context, width, height) {
			if (!this.map) { return; }
			context.save();
			
			// Update camera transform
			Z.camera.update(context, width, height);
			
			// State transition (fade in/out)
			var amount = this.state.transitionAmount;
			if (this.state.transitionType == Z.stateTransition.transitionOut) {
				amount = 1 - amount;
			}
			context.globalAlpha = amount;
			
			// Draw map and actors
			this.map.draw(context);
			
			// Draw captions
			Z.captionManager.draw(context);
			
			// Draw hud
			Z.hud.draw(context, width, height);
			context.restore();
		}
	};
}());