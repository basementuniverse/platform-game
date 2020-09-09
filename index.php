<?php $id = isset($_GET["id"]) ? $_GET["id"] : ""; ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Platform Game</title>
	<meta charset="UTF-8">
	<link href="images/favicon.png" rel="shortcut icon" type="image/png">
	<link href="http://fonts.googleapis.com/css?family=Open+Sans:400italic,400,700" rel="stylesheet" type="text/css">
	<!--RELEASE_START
	<link rel="stylesheet" type="text/css" href="styles/main.css">
	<script type="text/javascript" src="scripts/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="scripts/common.min.js"></script>
	<script type="text/javascript" src="scripts/game.min.js"></script>
	RELEASE_END-->
	<!--DEBUG_START-->
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="scripts/common/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="scripts/common/less-2.1.0.min.js"></script>
	<script type="text/javascript" src="scripts/common/vec2.js"></script>
	<script type="text/javascript" src="scripts/common/common.js"></script>
	<script type="text/javascript" src="scripts/common/keys.js"></script>
	<script type="text/javascript" src="scripts/z.js"></script>
	<script type="text/javascript" src="scripts/main.js"></script>
	<script type="text/javascript" src="scripts/settings.js"></script>
	<script type="text/javascript" src="scripts/debug.js"></script>
	<script type="text/javascript" src="scripts/content.js"></script>
	<script type="text/javascript" src="scripts/utilities.js"></script>
	<script type="text/javascript" src="scripts/input.js"></script>
	<script type="text/javascript" src="scripts/states/statemanager.js"></script>
	<script type="text/javascript" src="scripts/states/intro.js"></script>
	<script type="text/javascript" src="scripts/states/message.js"></script>
	<script type="text/javascript" src="scripts/states/prompt.js"></script>
	<script type="text/javascript" src="scripts/states/maptransition.js"></script>
	<script type="text/javascript" src="scripts/menu/menu.js"></script>
	<script type="text/javascript" src="scripts/menu/menuitem.js"></script>
	<script type="text/javascript" src="scripts/menu/mainmenu.js"></script>
	<script type="text/javascript" src="scripts/menu/pausemenu.js"></script>
	<script type="text/javascript" src="scripts/game/game.js"></script>
	<script type="text/javascript" src="scripts/game/camera.js"></script>
	<script type="text/javascript" src="scripts/game/world.js"></script>
	<script type="text/javascript" src="scripts/game/map.js"></script>
	<script type="text/javascript" src="scripts/game/mapchunk.js"></script>
	<script type="text/javascript" src="scripts/game/collision.js"></script>
	<script type="text/javascript" src="scripts/game/background.js"></script>
	<script type="text/javascript" src="scripts/game/sprite.js"></script>
	<script type="text/javascript" src="scripts/game/animation.js"></script>
	<script type="text/javascript" src="scripts/game/hud.js"></script>
	<script type="text/javascript" src="scripts/game/sound.js"></script>
	<script type="text/javascript" src="scripts/game/music.js"></script>
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
	<script type="text/javascript" src="scripts/game/captions/captionmanager.js"></script>
	<script type="text/javascript" src="scripts/game/captions/caption.js"></script>
	<script type="text/javascript" src="scripts/game/captions/actorcaption.js"></script>
	<script type="text/javascript" src="scripts/game/captions/screencaption.js"></script>
	<!--DEBUG_END-->
	<script type="text/javascript">
	
	$(document).ready(function() {
		Z.main.initialise(<?php echo "\"$id\""; ?>);	// Use index.php?id=N
	});
	
	</script>
</head>
<body class="game">
	<div class="loadfont">.</div>
	<div class="game"></div>
	<div class="loading">
		<img src="images/loading.gif">
		<span class="progress"></span>
	</div>
</body>
</html>