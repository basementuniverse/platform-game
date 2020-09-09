<?php

header('Content-type: application/json');

$content = "content.json";
$emptyWorld = "emptyworld.json";

// Make sure both the content list and empty world definition files exist and are readable
if (!file_exists($content)) { die("File doesn't exist: $content"); }
if (!is_readable($content)) { die("File is unreadable: $content"); }

if (!file_exists($emptyWorld)) { die("File doesn't exist: $emptyWorld"); }
if (!is_readable($emptyWorld)) { die("File is unreadable: $emptyWorld"); }

// If a world id has been specified, substitute the world id so that it can be loaded from the
// server api, otherwise substitute the world data with an empty world
$output = file_get_contents($content);
if (isset($_GET["id"])) {
	$output = str_replace("{{WORLD_ID}}", $_GET["id"], $output);
	$output = str_replace("{{WORLD_DATA}}", "", $output);
} else {
	$output = str_replace("\"{{WORLD_DATA}}\"", file_get_contents($emptyWorld), $output);
	$output = str_replace("{{WORLD_ID}}", "", $output);
}
echo $output;

?>