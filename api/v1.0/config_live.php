<?php

// Database connection
$CFG["dbhost"] =				"localhost";
$CFG["dbname"] =				"basemeo3_platform";
$CFG["dbuser"] =				"basemeo3_platfor";
$CFG["dbpass"] =				"9V]0h4mvmSrf";

// API version
$CFG["api_version"] =			"1.0";

// The number of items to return per page
$CFG["pagesize"] =				10;

// Timezone and date format
$CFG["timezone"] =				"GMT";
$CFG["dateformat"] =			"g:ia jS F Y";

// User creation
$CFG["passwordhash"] =			PASSWORD_BCRYPT;
$CFG["passwordcost"] =			10;

function closeCursor($query) {
	do { $query->fetchAll(); $query->closeCursor(); } while($query->nextRowset());
}

?>