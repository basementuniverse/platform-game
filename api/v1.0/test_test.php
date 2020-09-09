<?php

// Return a test value, for testing the test framework
//	GET test_test
$api->AddRoute("test_test", "GET", function() {
	return array("Test" => 1);
});

?>