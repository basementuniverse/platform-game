<?php

final class World {
	public $Id = 0,
		$Name = "",
		$Description = "",
		$Data = "",
		$Created = "",
		$Updated = "",
		$UserId = 0,
		$UserName = "",
		$Private = false;
	
	// Valid and default sort fields for ordering worlds
	public static $ValidOrderFields = array(
			"Name",
			"Created",
			"Updated",
			"User",
			"Private"
		),
		$DefaultOrderField = "Name",
		$DefaultDescending = true;
	
	// Database field names for sortable fields
	private static $orderFieldNames = array(
			"name" => "name",
			"created" => "created",
			"updated" => "updated",
			"user" => "username",
			"private" => "private"
		);
	
	private function __construct($values) {
		global $CFG;
		$this->Id = $values["id"];
		$this->Name = $values["name"];
		$this->Description = $values["description"];
		$this->Data = $values["data"];
		$this->Created = date($CFG["dateformat"], strtotime($values["created"]));
		$this->Updated = $values["updated"] ?
			date($CFG["dateformat"], strtotime($values["updated"])) : "Never";
		$this->UserId = $values["userid"];
		$this->UserName = $values["username"];
		$this->Private = $values["private"] == "1";
	}
	
	// Create a new world
	//	db:			The database connection
	//	user:		The current user
	//	data:		A hash array of world data which should contain the following keys:
	//				name:			The world name
	//				description:	The world description (optional)
	//				data:			The world data (optional)
	//				private:		True if the world is private (only visible to it's author)
	public static function Create($db, $user, $data) {
		global $CFG;
		
		// Make sure the user is logged in
		if (empty($user->Id)) {
			throw new Exception("Couldn't create world: user is not logged in");
		}
		
		// Check that all required fields are present
		if (empty($data["name"])) {
			throw new Exception("Couldn't create world: field 'name' is missing or empty");
		}
		$private = (isset($data["private"]) && strtolower($data["private"]) == "true");
		
		// Create world
		$query = $db->prepare(
			"CALL world_create(
				:currentuserid,
				:name,
				:description,
				:data,
				:private
			)"
		);
		$query->execute(array(
			":currentuserid" => $user->Id,
			":name" => $data["name"],
			":description" => isset($data["description"]) ? $data["description"] : "",
			":data" => isset($data["data"]) ? $data["data"] : "",
			":private" => $private
		));
		if ($query->rowCount() > 0) {	// World created successfully
			$id = $query->fetchColumn();
			closeCursor($query);
			
			// Get an instance of the world
			return self::Get($db, $user, $id);
		}
		closeCursor($query);
		return false;
	}
	
	// Get the specified world
	//	db:		The database connection
	//	user:	The current user
	//	id:		The id of the world to get
	public static function Get($db, $user, $id) {
		$query = $db->prepare("CALL world_get(:currentuserid, :worldid)");
		$query->execute(array(
			":currentuserid" => $user->Id,
			":worldid" => $id
		));
		$result = $query->fetch(PDO::FETCH_ASSOC);
		closeCursor($query);
		if ($result) {
			return new World($result);
		}
		return false;
	}
	
	// Return a page of worlds
	//	db:			The database connection
	//	user:		The current user
	//	userId:		Only get worlds belonging to this user (if not null)
	//	order:		The field to sort results by
	//	descending:	True if the results should be sorted in descending order (use null for default)
	//	page:		The page of results to return
	//	count:		Outputs the total number of worlds
	public static function GetPage(
		$db,
		$user,
		$userId,
		&$order,
		$descending,
		$page,
		&$count
	) {
		global $CFG;
		
		// Check order field is valid
		if (!in_array(strtolower($order), array_map("strtolower", self::$ValidOrderFields))) {
			$order = self::$DefaultOrderField;
		}
		$orderField = self::$orderFieldNames[strtolower($order)];
		
		// Check if results should be in descending order
		if ($descending === null) {
			$descending = self::$DefaultDescending;
		}
		if ($descending) {
			$orderField .= " DESC";
		}
		
		// Get page offset
		$offset = ($page - 1) * $CFG["pagesize"];
		
		// Get worlds
		$query = $db->prepare("CALL world_getpage(
			:currentuserid,
			:userid,
			:order,
			:offset,
			:limit)"
		);
		$query->execute(array(
			":currentuserid" => $user->Id,
			":userid" => $userId,
			":order" => $orderField,
			":offset" => $offset,
			":limit" => $CFG["pagesize"]
		));
		$result = $query->fetchAll(PDO::FETCH_ASSOC);
		if (count($result)) {
			$worlds = array();
			foreach ($result as $row) {
				$worlds[] = new World($row);
			}
			
			// Set the total number of worlds
			$query->nextRowset();
			$count = $query->fetchColumn();
			closeCursor($query);
			return $worlds;
		}
		closeCursor($query);
		return false;
	}
	
	// Update the specified world
	//	db:			The database connection
	//	user:		The current user
	//	id:			The id of the world to update
	//	data:		A hash array of world data which should contain the following keys:
	//				name:			The world name (optional)
	//				description:	The world description (optional)
	//				data:			The world data (optional)
	//				private:		The world private state (optional)
	public static function Update($db, $user, $id, $data) {
		global $CFG;
		
		// Make sure the user is logged in
		if (empty($user->Id)) {
			throw new Exception("Couldn't update world: user is not logged in");
		}
		
		// Update world
		$query = $db->prepare(
			"CALL world_update(
				:currentuserid,
				:worldid,
				:name,
				:description,
				:data,
				:private
			)"
		);
		$query->execute(array(
			":currentuserid" => $user->Id,
			":worldid" => $id,
			":name" => isset($data["name"]) ? $data["name"] : null,
			":description" => isset($data["description"]) ? $data["description"] : null,
			":data" => isset($data["data"]) ? $data["data"] : null,
			":private" => isset($data["private"]) ? $data["private"] : null
		));
		$result = $query->fetchColumn();
		closeCursor($query);
		return $result;
	}
	
	// Delete the specified world
	//	db:		The database connection
	//	user:	The current user
	//	id:		The id of the world to delete
	public static function Delete($db, $user, $id) {
		global $CFG;
		
		// Make sure the user is logged in
		if (empty($user->Id)) {
			throw new Exception("Couldn't delete world: user is not logged in");
		}
		
		// Delete world
		$query = $db->prepare("CALL world_delete(:currentuserid, :worldid)");
		$query->execute(array(
			":currentuserid" => $user->Id,
			":worldid" => $id
		));
		$result = $query->fetchColumn();
		closeCursor($query);
		return $result;
	}
	
	// Delete all worlds that belong to the current user
	//	db:		The database connection
	//	user:	The current user
	public static function DeleteAll($db, $user) {
		global $CFG;
		
		// Make sure the user is logged in
		if (empty($user->Id)) {
			throw new Exception("Couldn't delete worlds: user is not logged in");
		}
		
		// Delete worlds
		$query = $db->prepare("CALL world_deleteall(:currentuserid)");
		$query->execute(array(":currentuserid" => $user->Id));
		$result = $query->fetchColumn();
		closeCursor($query);
		return $result;
	}
}

?>