<?php

header('Content-type: application/json');
session_name("platformgame");
session_start();

require "password.php";
require "config.php";
require "api.php";
require "model/user.php";
require "model/world.php";

$api = new Api();

// Return the API version
//	GET version
$api->AddRoute("version", "GET", function() {
	global $CFG;
	return array("Version" => $CFG["api_version"]);
});

// Return a list of valid API paths
//	GET paths
$api->AddRoute("paths", "GET", function() use ($api) {
	return array("Paths" => $api->Paths);
});

// Return the page size from config
//	GET pagesize
$api->AddRoute("pagesize", "GET", function() use ($api) {
	return array("PageSize" => $api->PageSize);
});

// Return the timezone from config
//	GET timezone
$api->AddRoute("timezone", "GET", function() {
	global $CFG;
	return array("TimeZone" => $CFG["timezone"]);
});

// Return a list of valid field names for sorting worlds
//	GET worlds/order
$api->AddRoute("worlds/order", "GET", function() {
	return array(
		"SortFields" => World::$ValidOrderFields,
		"Default" => World::$DefaultOrderField,
		"DefaulDescending" => World::$DefaultDescending
	);
});

// Return a list of worlds
//	GET worlds
$api->AddRoute("worlds", "GET", function() use ($api) {
	$count = 0;
	$userId = isset($_GET["user"]) ? $_GET["user"] : null;
	$worlds = World::GetPage(
		$api->Database,
		$api->User,
		$userId,
		$api->Order,
		$api->Descending,
		$api->Page,
		$count
	);
	return $count > 0 ? array(
		"Worlds" => $worlds,
		"User" => $userId,
		"Total" => $count,
		"Order" => $api->Order,
		"Descending" => $api->Descending,
		"Page" => $api->Page,
		"Pages" => ceil($count / $api->PageSize)
	) : null;
});

// Create a world
//	POST worlds
//	{ "name": "", "description": "", "data": "", "private": false }
$api->AddRoute("worlds", "POST", function() use ($api) {
	$world = World::Create($api->Database, $api->User, $api->Data);
	if ($world) {
		return array("World" => $world);
	}
	throw new Exception("Couldn't create world", 400);
});

// Delete all worlds
//	DELETE worlds
$api->AddRoute("worlds", "DELETE", function() use ($api) {
	if (World::DeleteAll($api->Database, $api->User)) {
		return array("Result" => "Worlds deleted");
	}
	throw new Exception("Couldn't delete worlds", 400);
});

// Return a world
//	GET worlds/id
$api->AddRoute("worlds/{id}", "GET", function($id) use ($api) {
	$world = World::Get($api->Database, $api->User, $id);
	if ($world) {
		return array("World" => $world);
	}
	throw new Exception("No world with that id ($id)", 404);
});

// Return a worlds's data
//	GET worlds/id/data
$api->AddRoute("worlds/{id}/data", "GET", function($id) use ($api) {
	$world = World::Get($api->Database, $api->User, $id);
	if ($world) {
		return json_decode($world->Data);
	}
	throw new Exception("No world with that id ($id)", 404);
});

// Update a world
//	PUT worlds/id
//	{ "name": "", "description": "", "data": "", "private": false }
$api->AddRoute("worlds/{id}", "PUT", function($id) use ($api) {
	if (World::Update($api->Database, $api->User, $id, $api->Data)) {
		return array("World" => World::Get($api->Database, $api->User, $id));
	}
	throw new Exception("World update failed ($id)", 400);
});

// Delete a world
//	DELETE worlds/id
$api->AddRoute("worlds/{id}", "DELETE", function($id) use ($api) {
	if (World::Delete($api->Database, $api->User, $id)) {
		return array("Result" => "World deleted");
	}
	throw new Exception("No world with that id ($id)", 404);
});

// Create a user
//	POST users
//	{ "username": "", "password": "" }
$api->AddRoute("users", "POST", function() use ($api) {
	if (User::Create($api->Database, $api->User, $api->Data)) {
		// Log the user in
		$user = User::Login($api->Database, $api->User, array(
			"username" => $api->Data["username"],
			"password" => $api->Data["password"]
		));
		return array("User" => $user);
	}
	throw new Exception("Couldn't create user", 400);
});

// Login to a user account
//	POST login
//	{ "username": "", "password": "" }
$api->AddRoute("login", "POST", function() use ($api) {
	$user = User::Login($api->Database, $api->User, $api->Data);
	if ($user) {
		return array("User" => $user);
	}
	throw new Exception("Login failed", 400);
});

// Logout of a user account
//	POST logout
$api->AddRoute("logout", "POST", function() use ($api) {
	User::Logout();
	return null;
});

// Return the current user
//	GET me
$api->AddRoute("me", "GET", function() use ($api) {
	return array("User" => $api->User);
});

// Update the current user
//	PUT me
//	{ "username": "", "password": "", "newpassword": "" }
$api->AddRoute("me", "PUT", function() use ($api) {
	if (User::Update($api->Database, $api->User, $api->Data)) {
		return array("User" => User::Get($api->Database, $api->User));
	}
	throw new Exception("User update failed", 400);
});

// Test routes
require "test_test.php";
require "test_reset.php";

$api->ProcessRequest();
echo $api;

?>