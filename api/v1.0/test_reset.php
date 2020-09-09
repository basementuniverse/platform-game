<?php

// Reset the API for testing
//	GET test_reset
$api->AddRoute("test_reset", "GET", function() use ($api) {
	// Clear session variables and end session
	$_SESSION["loggedin"] = false;
	$_SESSION["userid"] = "";
	session_destroy();
	
	// Clear the database
	$api->Database->prepare("DELETE FROM worlds")->execute();
	$api->Database->prepare("DELETE FROM users")->execute();
	return null;
});

?>