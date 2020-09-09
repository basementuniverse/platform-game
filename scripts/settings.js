"use strict";
Z.settings = {
	debug: true,							// Enable/disable debug messages
	showFPS: true,							// Show/hide framerate (debug must also be enabled)
	contentPath: "content/",				// The main content list path
	apiPath: "api/v1.0/",					// The world API path
	defaultWorld: "23754608476160029",		// Default world id to load
	showIntro: true,						// Display intro state or go directly to main menu
	scale: 2,								// Canvas scaling factor
	stateTransitionTime: 0.5,				// State transition time in seconds
	font: "a04b_03",						// The font face to use for all in-game text
	fontSize: "10pt",						// The font size to use in messages, prompts, menus etc.
	tileSize: 20,							// Tile size in pixels (scaled by Z.settings.scale)
	mapChunkSize: 8,						// Size of map chunks in tiles
	gravity: 0.6,							// Gravity amount
	flyingGravity: 0.05,					// Gravity amount when flying
	liquidGravity: 0.1,						// Gravity amount when in liquid
	airResistance: 0.9,						// Horizontal movement resistance while falling
	liquidResistance: 0.7,					// Horizontal movement resistance when in liquid
	maxSpeed: 600,							// Maximum actor speed in pixels per second
	minMoveForce: 0.05,						// Minimum movement force on slippery surfaces
	audioEnabled: true,						// Enable/disable music and sound effects
	lightingEnabled: true					// Enable/disable lighting effects
};

// State transition phase
Z.stateTransition = {
	transitionin: 0,						// Transitioning in
	transitionOut: 1						// Transitioning out
};

// Message state type
Z.messageType = {
	information: 0,							// Information message
	error: 1								// Error message
};

// Valid actor base types for the actor factory
Z.actorTypes = {
	block: "block",							// Pushable block
	door: "door",							// Switchable obstacle/door
	platform: "platform",					// Moving platform
	character: "character",					// Enemy/NPC
	decoration: "decoration",				// Sprite decoration
	powerup: "powerup",						// Generic powerup (add points only)
	health: "healthPowerup",				// Add health powerup
	superhealth: "superHealthPowerup",		// Add health (above maximum) powerup
	inventory: "inventoryPowerup",			// Add inventory item powerup
	invulnerable: "invulnerabilityPowerup",	// Make player temporarily invulnerable powerup
	invisible: "invisibilityPowerup",		// Make player temporarily invisible powerup
	flying: "flyingPowerup",				// Allow flying powerup
	superspeed: "superSpeedPowerup",		// Temporarily increase player speed powerup
	superjump: "superJumpPowerup",			// Temporarily increase jump strength powerup
	powerattack: "powerAttackPowerup",		// Temporarily increase attack damage powerup
	autofire: "autoFirePowerup",			// Allow automatic fire powerup
	waterbreathing: "waterBreathingPowerup"	// Allow underwater breathing
};

// Valid entity types for the entity factory
Z.entityTypes = {
	or: "orGate",							// OR gate
	nand: "nandGate",						// NAND gate
	latch: "latch",							// Latch/toggle latch
	delay: "delay",							// Timed delay
	timer: "timer",							// Single/repeating timer
	counter: "counter",						// Activation counter
	collision: "collisionMarker",			// Actor collision marker
	use: "useMarker",						// Player use marker
	jump: "jumpMarker",						// Actor jump marker
	move: "moveMarker",						// Actor movement marker
	powerup: "powerupMarker",				// Activate when the colliding player has a powerup
	inventory: "inventoryMarker",			// Activate when the colliding player has inventory
	damage: "damageMarker",					// Damage actors
	force: "forceMarker",					// Apply force to actors
	particle: "particleEmitterTrigger",		// Emits particles
	actorstate: "actorStateTrigger",		// Change an actor's active state
	actorspawn: "actorSpawnTrigger",		// Spawn an actor
	actorhealth: "actorHealthTrigger",		// Activate when an actor has matching health
	lightstate: "lightStateTrigger",		// Change a light's active state
	caption: "captionTrigger",				// Trigger a caption or dialog box
	maptransition: "mapTransitionTrigger",	// Triggers a map transition
	camerashake: "cameraShakeTrigger",		// Causes the camera viewport to shake
	cameratarget: "cameraTargetTrigger",	// Temporarily change the camera target actor
	sound: "soundTrigger",					// Play a sound effect
	music: "musicTrigger",					// Start playing a music track
	global: "globalFlagTrigger"				// Set or get a global flag state
};

// Valid light types for the light factory
Z.lightTypes = {
	ambient: "ambientLight",				// Ambient (global) light
	point: "pointLight",					// Point (circular) light
	spot: "spotLight"						// Spot (directional) light
};

// Valid light animation types for the light animation factory
Z.lightAnimationTypes = {
	blink: "lightBlinkAnimation",			// Blinking lights with blink pattern
	flash: "lightFlashAnimation",			// Flashing full-bright light animation
	flicker: "lightFlickerAnimation",		// Flickering light animation
	jitter: "lightJitterAnimation",			// Jittering point/spot light movement animation
	pulse: "lightPulseAnimation",			// Pulsing light brightness animation
	rotate: "lightRotateAnimation"			// Rotating spot light animation
};

// Editor tool types
Z.editorTool = {
	select: 0,								// Select items
	move: 1,								// Move the camera
	tile: 2									// Draw tiles
};

// Editor select tool sub-modes
Z.editorSelectToolMode = {
	place: 0,								// Place a new item
	connect: 1								// Connect selected item to another item
};

// Property types for item properties displayed in the editor
Z.editorPropertyType = {
	number: 0,								// Number slider (or input if min/max not defined)
	toggle: 1,								// Toggle button
	text: 2,								// Text input
	select: 3,								// Drop-down menu
	connect: 4,								// Connection to another item
	vector: 5,								// Vector input
	direction: 6,							// Direction selector
	range: 7,								// Number sliders or inputs for min/max values
	colour: 8,								// Colour selector
	custom: 9								// Type-specific property
};

// Output types for the direction selector input
Z.directionControlOutputType = {
	vector: 0,								// Output direction as a normalised vec2
	array: 1,								// Output direction as an array
	radians: 0								// Output direction in radians
};

// Character visual range types
Z.characterVisionType = {
	none: 0,								// Character cannot see the player
	horizontal: 1,							// Character can see horizontally
	vertical: 2,							// Character can see vertically
	directional: 3							// Character can see horizontally in the current facing
											// direction (either left or right)
};

// Character events
Z.characterEvent = {
	activate: "activate",					// Character is activated
	deactivate: "deactivate",				// Character is de-activated
	playerCollision: "playercollision",		// Player collides with character
	playerProximity: "playerproximity",		// Player within proximity range of character
	playerVisible: "playervisible",			// Character can see the player
	playerNotVisible: "playernotvisible",	// Character has lost sight of the player
	damage: "damage",						// Character is damaged
	dead: "dead",							// Character has died
	inLiquid: "inliquid",					// Character is touching a liquid tile
	outLiquid: "outliquid",					// Character is no longer touching a liquid tile
	obstacle: "obstacle",					// Character is moving into an obstacle tile
	gap: "gap"								// Character is moving towards a gap in the floor ahead
};