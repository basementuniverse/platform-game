<?php $id = isset($_GET["id"]) ? $_GET["id"] : ""; ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Platform Game Editor</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link href="http://fonts.googleapis.com/css?family=Open+Sans:400italic,400,700" rel="stylesheet" type="text/css">
	<!--RELEASE_START
	<link rel="stylesheet" type="text/css" href="styles/main.css">
	<script type="text/javascript" src="scripts/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="scripts/jquery.tooltip.js"></script>
	<script type="text/javascript" src="scripts/common.min.js"></script>
	<script type="text/javascript" src="scripts/editor.min.js"></script>
	RELEASE_END-->
	<!--DEBUG_START-->
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="scripts/common/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="scripts/common/less-2.1.0.min.js"></script>
	<script type="text/javascript" src="scripts/common/vec2.js"></script>
	<script type="text/javascript" src="scripts/common/common.js"></script>
	<script type="text/javascript" src="scripts/common/keys.js"></script>
	<script type="text/javascript" src="scripts/common/jquery.tooltip.js"></script>
	<script type="text/javascript" src="scripts/z.js"></script>
	<script type="text/javascript" src="scripts/editor/editor.js"></script>
	<script type="text/javascript" src="scripts/settings.js"></script>
	<script type="text/javascript" src="scripts/debug.js"></script>
	<script type="text/javascript" src="scripts/content.js"></script>
	<script type="text/javascript" src="scripts/utilities.js"></script>
	<script type="text/javascript" src="scripts/editor/camera.js"></script>
	<script type="text/javascript" src="scripts/editor/input.js"></script>
	<script type="text/javascript" src="scripts/editor/toolbar.js"></script>
	<script type="text/javascript" src="scripts/editor/statusbar.js"></script>
	<script type="text/javascript" src="scripts/editor/tilegrid.js"></script>
	<script type="text/javascript" src="scripts/editor/toolcursor.js"></script>
	<script type="text/javascript" src="scripts/editor/prompt.js"></script>
	<script type="text/javascript" src="scripts/editor/actionlist.js"></script>
	<script type="text/javascript" src="scripts/editor/collisionoverlay.js"></script>
	<script type="text/javascript" src="scripts/editor/collisionoverlaychunk.js"></script>
	<script type="text/javascript" src="scripts/editor/mapfunctions.js"></script>
	<script type="text/javascript" src="scripts/editor/itemselection.js"></script>
	<script type="text/javascript" src="scripts/editor/itemresize.js"></script>
	<script type="text/javascript" src="scripts/editor/actorfunctions.js"></script>
	<script type="text/javascript" src="scripts/editor/entityfunctions.js"></script>
	<script type="text/javascript" src="scripts/editor/lightfunctions.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/menuselector.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/togglebutton.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/colourselector.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/slidercontrol.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/numberinput.js"></script>
	<script type="text/javascript" src="scripts/editor/controls/textureselector.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/dialogs.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/textureatlasesdialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/textureatlasitem.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/backgroundsdialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/backgrounditem.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/propertiesdialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/addtiletypedialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/edittiletypedialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/logindialog.js"></script>
	<script type="text/javascript" src="scripts/editor/dialogs/itemlibrarydialog.js"></script>
	<script type="text/javascript" src="scripts/editor/toolpanels/toolpanel.js"></script>
	<script type="text/javascript" src="scripts/editor/toolpanels/tiletoolpanel.js"></script>
	<script type="text/javascript" src="scripts/editor/toolpanels/selecteditemtoolpanel.js"></script>
	<script type="text/javascript" src="scripts/editor/toolpanels/itemlisttoolpanel.js"></script>
	<script type="text/javascript" src="scripts/game/world.js"></script>
	<script type="text/javascript" src="scripts/game/map.js"></script>
	<script type="text/javascript" src="scripts/game/mapchunk.js"></script>
	<script type="text/javascript" src="scripts/game/background.js"></script>
	<script type="text/javascript" src="scripts/game/sprite.js"></script>
	<script type="text/javascript" src="scripts/game/animation.js"></script>
	<script type="text/javascript" src="scripts/game/actors/actorfactory.js"></script>
	<script type="text/javascript" src="scripts/game/actors/actor.js"></script>
	<script type="text/javascript" src="scripts/game/actors/player.js"></script>
	<script type="text/javascript" src="scripts/game/actors/block.js"></script>
	<script type="text/javascript" src="scripts/game/actors/platform.js"></script>
	<script type="text/javascript" src="scripts/game/actors/projectile.js"></script>
	<script type="text/javascript" src="scripts/game/actors/decoration.js"></script>
	<script type="text/javascript" src="scripts/game/actors/door.js"></script>
	<script type="text/javascript" src="scripts/game/actors/character.js"></script>
	<script type="text/javascript" src="scripts/game/actors/characterstate.js"></script>
	<script type="text/javascript" src="scripts/game/actors/particle.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/powerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/autofirepowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/flyingpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/healthpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/inventorypowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/invisibilitypowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/invulnerabilitypowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/powerattackpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/superhealthpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/superjumppowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/superspeedpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/actors/powerups/waterbreathingpowerup.js"></script>
	<script type="text/javascript" src="scripts/game/entities/entityfactory.js"></script>
	<script type="text/javascript" src="scripts/game/entities/entity.js"></script>
	<script type="text/javascript" src="scripts/game/entities/collisionmarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/movemarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/jumpmarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/usemarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/powerupmarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/inventorymarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/damagemarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/forcemarker.js"></script>
	<script type="text/javascript" src="scripts/game/entities/orgate.js"></script>
	<script type="text/javascript" src="scripts/game/entities/nandgate.js"></script>
	<script type="text/javascript" src="scripts/game/entities/latch.js"></script>
	<script type="text/javascript" src="scripts/game/entities/delay.js"></script>
	<script type="text/javascript" src="scripts/game/entities/timer.js"></script>
	<script type="text/javascript" src="scripts/game/entities/counter.js"></script>
	<script type="text/javascript" src="scripts/game/entities/actorstatetrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/actorspawntrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/actorhealthtrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/lightstatetrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/particleemittertrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/camerashaketrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/cameratargettrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/captiontrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/maptransitiontrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/soundtrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/musictrigger.js"></script>
	<script type="text/javascript" src="scripts/game/entities/globalflagtrigger.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/lightmap.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/lightfactory.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/light.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/ambientlight.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/pointlight.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/spotlight.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightanimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightanimationfactory.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightblinkanimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightflashanimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightflickeranimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightjitteranimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightpulseanimation.js"></script>
	<script type="text/javascript" src="scripts/game/lighting/animations/lightrotateanimation.js"></script>
	<script type="text/javascript" src="scripts/editor/playerstartmarker.js"></script>
	<script type="text/javascript" src="scripts/editor/platformwaypointmarker.js"></script>
	<!--DEBUG_END-->
	<script type="text/javascript">
	
	$(document).ready(function() {
		Z.editor.initialise(<?php echo "\"$id\""; ?>);	// Use editor.php?id=N
	});
	
	</script>
</head>
<body class="editor">
	<div class="loadfont">.</div>
	<div class="editor">
		
		<!-- TOOLBAR -->
		<div class="toolbar">
			<a href="javascript:void(0)" class="button savebutton"
				data-tooltip="Save world <span class='keyboard-shortcut'>Ctrl-S</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-x="-1"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-x="-10"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up tooltip-arrow-up-left"></a>
			<a href="javascript:void(0)" class="button propertiesbutton"
				data-tooltip="World properties"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-x="-1"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-x="-10"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up tooltip-arrow-up-left"></a>
			<a href="javascript:void(0)" class="button selectbutton dialogdisable"
				data-tooltip="Select <span class='keyboard-shortcut'>S</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button movecamerabutton dialogdisable"
				data-tooltip="Move camera <span class='keyboard-shortcut'>M</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button tilebutton dialogdisable"
				data-tooltip="Edit tiles <span class='keyboard-shortcut'>T</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button textureatlasesbutton"
				data-tooltip="Textures"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button backgroundsbutton"
				data-tooltip="Backgrounds"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button undobutton disabled dialogdisable"
				data-tooltip="Undo <span class='keyboard-shortcut'>Ctrl-Z</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button redobutton disabled dialogdisable"
				data-tooltip="Redo <span class='keyboard-shortcut'>Ctrl-Y</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<a href="javascript:void(0)" class="button deletemapbutton disabled dialogdisable"
				data-tooltip="Delete this map"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
			<div class="dropdown dialogdisable" data-callback="currentMap" id="mapselect">
				<a href="javascript:void(0)" class="currentvalue"></a>
				<img class="dropdownicon" src="images/editor/dropdownicon.png">
				<ul class="menuitems">
					<li class="separator"></li>
					<li class="createmap">
						<a href="javascript:void(0)" class="addmapbutton">Add map...</a>
					</li>
				</ul>
			</div>
			<a href="javascript:void(0)" class="button toolpanelbutton dialogdisable"
				data-tooltip="Toolpanel <span class='keyboard-shortcut'>C</span>"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-x="1"
				data-tooltip-origin-y="-1"
				data-tooltip-offset-x="10"
				data-tooltip-offset-y="24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-up tooltip-arrow-up-right"></a>
		</div>
		
		<!-- TOOLPANEL -->
		<div class="toolpanel dialogdisable small">
			<div class="resize"></div>
			
			<!-- ITEM LIST -->
			<div class="toolpanelcontent itemlist">
				<div class="itembuttons"></div>
			</div>
			
			<!-- SELECTED ITEM PROPERTIES -->
			<div class="toolpanelcontent selecteditem">
				<a href="javascript:void(0)" class="button closebutton">Back</a>
				<a href="javascript:void(0)" class="button deletebutton"
					data-tooltip="Delete this item <span class='keyboard-shortcut'>Delete</span>"
					data-tooltip-anchor-x="0"
					data-tooltip-anchor-y="0"
					data-tooltip-origin-x="1"
					data-tooltip-origin-y="-1"
					data-tooltip-offset-x="10"
					data-tooltip-offset-y="24"
					data-tooltip-classname="tooltip-arrow tooltip-arrow-up tooltip-arrow-up-right"></a>
				<div class="itemproperties"></div>
			</div>
			
			<!-- TILE TYPES -->
			<div class="toolpanelcontent tiletypes">
				<div class="tiletypebuttons"></div>
			</div>
		</div>
		
		<!-- STATUS BAR -->
		<div class="statusbar">
			<a href="javascript:void(0)" class="button originbutton"
				data-tooltip="Center on player"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-x="-1"
				data-tooltip-origin-y="1"
				data-tooltip-offset-x="-10"
				data-tooltip-offset-y="-24"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-down tooltip-arrow-down-left"></a>
			<acronym
				data-tooltip="Set camera position"
				data-tooltip-anchor-x="0"
				data-tooltip-anchor-y="0"
				data-tooltip-origin-x="-1"
				data-tooltip-origin-y="1"
				data-tooltip-offset-x="30"
				data-tooltip-offset-y="-9"
				data-tooltip-classname="tooltip-arrow tooltip-arrow-down">
				<span id="statustext"></span>
			</acronym>
			
			<!-- SET CAMERA POSITION FORM -->
			<div class="cameraposition">
				<div class="camerapositioninputs">
					<input type="text" class="number" id="cameraposition_x" placeholder="x">
					<input type="text" class="number" id="cameraposition_y" placeholder="y">
					(Tile: <input type="text" class="number" id="cameraposition_tilex" placeholder="x">
					<input type="text" class="number" id="cameraposition_tiley" placeholder="y">)
				</div>
				<a href="javascript:void(0)" class="button setcamerapositionbutton"
					data-tooltip="Set camera position"
					data-tooltip-anchor-x="0"
					data-tooltip-anchor-y="0"
					data-tooltip-origin-y="1"
					data-tooltip-offset-y="-24"
					data-tooltip-classname="tooltip-arrow tooltip-arrow-down"></a>
				<a href="javascript:void(0)" class="button cancelsetcamerapositionbutton"
					data-tooltip="Cancel"
					data-tooltip-anchor-x="0"
					data-tooltip-anchor-y="0"
					data-tooltip-origin-y="1"
					data-tooltip-offset-y="-24"
					data-tooltip-classname="tooltip-arrow tooltip-arrow-down"></a>
			</div>
			
			<!-- SHOW/HIDE MENU -->
			<div class="dropdown dropup dialogdisable">
				<a href="javascript:void(0)" class="button showhidebutton"
					data-tooltip="Show/hide"
					data-tooltip-anchor-x="-1"
					data-tooltip-anchor-y="0"
					data-tooltip-origin-x="1"
					data-tooltip-offset-x="-14"
					data-tooltip-classname="tooltip-arrow tooltip-arrow-right"></a>
				<ul id="showhideselect">
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="tileGrid">Tile Grid</a></li>
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="collisionEdges">Collidable Edges</a></li>
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="background">Background</a></li>
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="actors">Actors</a></li>
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="entities">Entities</a></li>
					<li><a href="javascript:void(0)" class="togglebutton" data-callback="showHide" data-arg="lighting">Lighting</a></li>
				</ul>
			</div>
		</div>
		
		<!-- EDITOR & TOOL CURSOR CANVAS -->
		<canvas id="editor"
			data-tooltip=""
			data-tooltip-origin-y="-1"
			data-tooltip-offset-y="20"
			data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></canvas>
		<canvas id="toolcursor"></canvas>
		
		<!-- LOGIN DIALOG -->
		<div class="dialog login">
			<div class="dialogcontent">
				<div class="errors"></div>
				<a href="javascript:void(0)" class="button resetbutton">Cancel</a>
				<a href="javascript:void(0)" class="button closebutton">Login</a>
				<h1>User Login</h1>
				<hr>
				<div class="field">
					<label for="username">Name</label>
					<input type="text" id="username" value="">
				</div>
				<div class="field">
					<label for="password">Password</label>
					<input type="password" id="password" value="">
				</div>
			</div>
		</div>
		
		<!-- WORLD PROPERTIES DIALOG -->
		<div class="dialog worldproperties">
			<div class="dialogcontent">
				<div class="errors"></div>
				<a href="javascript:void(0)" class="button resetbutton">Reset</a>
				<a href="javascript:void(0)" class="button closebutton">Finished</a>
				<h1>World Properties</h1>
				<hr>
				<div class="field">
					<label for="worldname">Name</label>
					<input type="text" id="worldname" value="">
				</div>
				<div class="field">
					<label for="worlddescription">Description</label>
					<textarea id="worlddescription"></textarea>
				</div>
				<div class="field">
					<label>Private</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="worldPrivate" id="worldprivate">No</a>
				</div>
				<div class="field">
					<label>Starting Map</label>
					<div class="dropdown" data-callback="startingMap" id="startingmapselect">
						<a href="javascript:void(0)" class="currentvalue"></a>
						<img class="dropdownicon" src="images/editor/dropdownicon.png">
						<ul class="menuitems"></ul>
					</div>
				</div>
				<div class="mapproperties">
					<h1>Map Properties</h1>
					<hr>
					<div class="field">
						<label for="mapname">Name</label>
						<input type="text" id="mapname" value="">
					</div>
					<div class="field">
						<label>Persistent</label>
						<a href="javascript:void(0)" class="togglebutton" data-callback="mapPersistent" id="mappersistent">No</a>
					</div>
					<div class="field">
						<label>Background Colour</label>
						<div class="dropdown colourselector" data-callback="backgroundColour" id="backgroundcolourselector">
							<a href="javascript:void(0)" class="currentvalue">
								<div class="colourpreview"><div class="colourpreviewinner"></div></div>
								<span class="currentvaluetext"></span>
							</a>
							<img class="dropdownicon" src="images/editor/dropdownicon.png">
							<div class="colourselector">
								<div class="colourpreview"><div class="colourpreviewinner"></div></div>
								<div><label class="colour">R</label> <div class="colourslider red"></div></div>
								<div><label class="colour">G</label> <div class="colourslider green"></div></div>
								<div><label class="colour">B</label> <div class="colourslider blue"></div></div>
								<div><label class="colour">A</label> <div class="colourslider alpha"></div></div>
							</div>
						</div>
					</div>
					<div class="field">
						<label>Background Image</label>
						<div class="dropdown" data-callback="backgroundImage" id="backgroundimageselect">
							<a href="javascript:void(0)" class="currentvalue"></a>
							<img class="dropdownicon" src="images/editor/dropdownicon.png">
							<ul class="menuitems"></ul>
						</div>
					</div>
					<div class="field">
						<label for="backgroundoffsetx">Background Offset</label>
						<label for="backgroundoffsetx" class="dimension">X</label> <input type="text" id="backgroundoffsetx" class="number" value="">
						<label for="backgroundoffsety" class="dimension">Y</label> <input type="text" id="backgroundoffsety" class="number" value="">
					</div>
					<div class="field">
						<label>Background Repeat</label>
						<label class="dimension">X</label> <a href="javascript:void(0)" class="togglebutton" data-callback="backgroundRepeatX" id="backgroundrepeatx">No</a>
						<label class="dimension">Y</label> <a href="javascript:void(0)" class="togglebutton" data-callback="backgroundRepeatY" id="backgroundrepeaty">No</a>
					</div>
					<div class="field">
						<label>Background Parallax</label>
						<label class="dimension">X</label> <div class="slider" data-callback="backgroundParallaxX" id="backgroundparallaxx"></div>
						<label class="dimension">Y</label> <div class="slider" data-callback="backgroundParallaxY" id="backgroundparallaxy"></div>
					</div>
				</div>
			</div>
		</div>
		
		<!-- BACKGROUNDS DIALOG -->
		<div class="dialog backgrounds">
			<div class="dialogcontent">
				<a href="javascript:void(0)" class="button resetbutton">Reset</a>
				<a href="javascript:void(0)" class="button closebutton">Finished</a>
				<h1>Background Images</h1>
				<hr>
				<div class="items"></div>
				<a href="javascript:void(0)" class="button addbutton">Add image...</a>
			</div>
		</div>
		
		<!-- TEXTURE ATLASES DIALOG -->
		<div class="dialog textureatlases">
			<div class="dialogcontent">
				<a href="javascript:void(0)" class="button resetbutton">Reset</a>
				<a href="javascript:void(0)" class="button closebutton">Finished</a>
				<h1>Textures</h1>
				<hr>
				<div class="items"></div>
				<a href="javascript:void(0)" class="button addbutton">Add image...</a>
			</div>
		</div>
		
		<!-- ADD TILE TYPE DIALOG -->
		<div class="dialog addtiletype">
			<div class="dialogcontent">
				<div class="errors"></div>
				<a href="javascript:void(0)" class="button deletebutton">Cancel</a>
				<a href="javascript:void(0)" class="button resetbutton">Reset</a>
				<a href="javascript:void(0)" class="button closebutton">Finished</a>
				<h1>Add Tile Type</h1>
				<hr>
				<div class="field">
					<label for="addtiletypename">Name</label>
					<input type="text" id="addtiletypename" value="">
				</div>
				<div class="field">
					<label>Texture Atlas</label>
					<div class="dropdown" data-callback="addTileTypeTextureAtlas" id="addtiletypetextureatlasselect">
						<a href="javascript:void(0)" class="currentvalue"></a>
						<img class="dropdownicon" src="images/editor/dropdownicon.png">
						<ul class="menuitems"></ul>
					</div>
				</div>
				<div class="field">
					<label>Texture</label>
					<div class="dropdown textureselector" data-callback="addTileTypeTextureOffset" id="addtiletypetextureoffsetselect">
						<a href="javascript:void(0)" class="currentvalue">
							<div class="texturepreview"><div class="texturepreviewinner"></div></div>
							<span class="currentvaluetext">0, 0</span>
						</a>
						<img class="dropdownicon" src="images/editor/dropdownicon.png">
						<div class="textureselector"></div>
					</div>
				</div>
				<div class="field">
					<label>Collisions</label>
					<a href="javascript:void(0)" class="togglebutton tilecollision solidtilebutton" data-callback="addTileTypeSolid" id="addtiletypesolid"
						data-tooltip="Solid"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision topedgetilebutton" data-callback="addTileTypeTopEdge" id="addtiletypetopedge"
						data-tooltip="Top edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision bottomedgetilebutton" data-callback="addTileTypeBottomEdge" id="addtiletypebottomedge"
						data-tooltip="Bottom edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision leftedgetilebutton" data-callback="addTileTypeLeftEdge" id="addtiletypeleftedge"
						data-tooltip="Left edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision rightedgetilebutton" data-callback="addTileTypeRightEdge" id="addtiletyperightedge"
						data-tooltip="Right edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision liquidtilebutton" data-callback="addTileTypeLiquid" id="addtiletypeliquid"
						data-tooltip="Liquid"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision laddertilebutton" data-callback="addTileTypeLadder" id="addtiletypeladder"
						data-tooltip="Ladder"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
				</div>
				<div class="field">
					<label>Draw Front</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="addTileTypeDrawFront" id="addtiletypedrawfront">No</a>
				</div>
				<div class="field">
					<label>Cast Shadow</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="addTileTypeCastShadow" id="addtiletypecastshadow">No</a>
				</div>
				<div class="field">
					<label>Friction</label>
					<div class="slider" data-callback="addTileTypeFriction" id="addtiletypefriction"></div>
				</div>
				<div class="field">
					<label>Conveyor Belt</label>
					<div class="slider negative" data-callback="addTileTypeConveyor" data-max="100" id="addtiletypeconveyor"></div>
				</div>
				<div class="field">
					<label>Breathable</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="addTileTypeBreathable" id="addtiletypebreathable">No</a>
				</div>
			</div>
		</div>
		
		<!-- EDIT TILE TYPE DIALOG -->
		<div class="dialog edittiletype">
			<div class="dialogcontent">
				<div class="errors"></div>
				<a href="javascript:void(0)" class="button deletebutton">Delete</a>
				<a href="javascript:void(0)" class="button resetbutton">Reset</a>
				<a href="javascript:void(0)" class="button closebutton">Finished</a>
				<h1>Edit Tile Type</h1>
				<hr>
				<div class="field">
					<label for="edittiletypename">Name</label>
					<input type="text" id="edittiletypename" value="">
				</div>
				<div class="field">
					<label>Texture Atlas</label>
					<div class="dropdown" data-callback="editTileTypeTextureAtlas" id="edittiletypetextureatlasselect">
						<a href="javascript:void(0)" class="currentvalue"></a>
						<img class="dropdownicon" src="images/editor/dropdownicon.png">
						<ul class="menuitems"></ul>
					</div>
				</div>
				<div class="field">
					<label>Texture</label>
					<div class="dropdown textureselector" data-callback="editTileTypeTextureOffset" id="edittiletypetextureoffsetselect">
						<a href="javascript:void(0)" class="currentvalue">
							<div class="texturepreview"><div class="texturepreviewinner"></div></div>
							<span class="currentvaluetext">0, 0</span>
						</a>
						<img class="dropdownicon" src="images/editor/dropdownicon.png">
						<div class="textureselector"></div>
					</div>
				</div>
				<div class="field">
					<label>Collisions</label>
					<a href="javascript:void(0)" class="togglebutton tilecollision solidtilebutton" data-callback="editTileTypeSolid" id="edittiletypesolid"
						data-tooltip="Solid"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision topedgetilebutton" data-callback="editTileTypeTopEdge" id="edittiletypetopedge"
						data-tooltip="Top edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision bottomedgetilebutton" data-callback="editTileTypeBottomEdge" id="edittiletypebottomedge"
						data-tooltip="Bottom edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision leftedgetilebutton" data-callback="editTileTypeLeftEdge" id="edittiletypeleftedge"
						data-tooltip="Left edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision rightedgetilebutton" data-callback="editTileTypeRightEdge" id="edittiletyperightedge"
						data-tooltip="Right edge"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision liquidtilebutton" data-callback="editTileTypeLiquid" id="edittiletypeliquid"
						data-tooltip="Liquid"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
					<a href="javascript:void(0)" class="togglebutton tilecollision laddertilebutton" data-callback="editTileTypeLadder" id="edittiletypeladder"
						data-tooltip="Ladder"
						data-tooltip-anchor-x="0"
						data-tooltip-anchor-y="0"
						data-tooltip-origin-y="-1"
						data-tooltip-offset-y="24"
						data-tooltip-classname="tooltip-arrow tooltip-arrow-up"></a>
				</div>
				<div class="field">
					<label>Draw Front</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="editTileTypeDrawFront" id="edittiletypedrawfront">No</a>
				</div>
				<div class="field">
					<label>Cast Shadow</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="editTileTypeCastShadow" id="edittiletypecastshadow">No</a>
				</div>
				<div class="field">
					<label>Friction</label>
					<div class="slider" data-callback="editTileTypeFriction" id="edittiletypefriction"></div>
				</div>
				<div class="field">
					<label>Conveyor Belt</label>
					<div class="slider negative" data-callback="editTileTypeConveyor" data-max="100" id="edittiletypeconveyor"></div>
				</div>
				<div class="field">
					<label>Breathable</label>
					<a href="javascript:void(0)" class="togglebutton" data-callback="editTileTypeBreathable" id="edittiletypebreathable">No</a>
				</div>
			</div>
		</div>
		
		<!-- ITEM LIBRARY DIALOG -->
		<div class="dialog itemlibrary">
			<div class="dialogcontent">
				<a href="javascript:void(0)" class="button closebutton">Cancel</a>
				<h1>Create a new item</h1>
				<hr>
				<div class="itembuttons"></div>
			</div>
		</div>
	</div>
	
	<!-- LOADING SCREEN -->
	<div class="loading">
		<img src="images/loading.gif">
		<span class="progress"></span>
	</div>
</body>
</html>