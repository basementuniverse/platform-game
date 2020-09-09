<?php

final class User {
	public $Id = 0,
		$Name = "";
	
	private function __construct($values) {
		global $CFG;
		$this->Id = $values["id"];
		$this->Name = $values["username"];
	}
	
	// Return a new guest user instance
	public static function Guest() {
		return new User(array(
			"id" => 0,
			"username" => "Guest"
		));
	}
	
	// Check if the specified username already exists
	//	db:			The database connection
	//	username:	The username to check
	public static function CheckUserName($db, $username) {
		if (strtolower($username) == "guest") { return false; }
		$query = $db->prepare("CALL user_checkusername(:username)");
		$query->execute(array(":username" => $username));
		$result = $query->fetchColumn();
		closeCursor($query);
		return $result;
	}
	
	// Create a new user
	//	db:		The database connection
	//	user:	The current user
	//	data:	A hash array of user data which should contain the following keys:
	//			username:		The user's logon name
	//			password:		The user's password
	public static function Create($db, $user, $data) {
		global $CFG;
		
		// Make sure there isn't a currently logged on user
		if ($user->Id != 0) {
			throw new Exception("Couldn't create user: there is already a user logged on");
		}
		
		// Check that all required fields are present
		if (empty($data["username"])) {
			throw new Exception("Couldn't create user: field 'username' is missing or empty");
		}
		if (empty($data["password"])) {
			throw new Exception("Couldn't create user: field 'password' is missing or empty");
		}
		
		// Make sure the requested username isn't already in use
		if (self::CheckUserName($db, $data["username"])) {
			throw new Exception("Couldn't create user: username is already in use");
		}
		
		// Create user
		$query = $db->prepare(
			"CALL user_create(:username, :password)"
		);
		$query->execute(array(
			":username" => $data["username"],
			":password" => password_hash(
				$data["password"],
				$CFG["passwordhash"],
				["cost" => $CFG["passwordcost"]]
			)
		));
		if ($query->rowCount() > 0) {	// User created successfully
			$id = $query->fetchColumn();
			closeCursor($query);
			
			// Get an instance of the user
			return self::Get($db, (object)array("Id" => $id));
		}
		return false;
	}
	
	// Get the current user
	//	db:		The database connection
	//	user:	The current user
	public static function Get($db, $user) {
		$query = $db->prepare("CALL user_get(:currentuserid)");
		$query->execute(array(":currentuserid" => $user->Id));
		$result = $query->fetch(PDO::FETCH_ASSOC);
		closeCursor($query);
		if ($result) {
			return new User($result);
		}
		return false;
	}
	
	// Update the current user
	//	db:		The database connection
	//	user:	The current user
	//	data:	A hash array of user data which should contain the following keys:
	//			username:		The user's new username (optional)
	//			password:		The user's current password (optional)
	//			newpassword:	The user's new password (optional)
	public static function Update($db, $user, $data) {
		// If a new username is specified, update the user's name
		if (isset($data["username"])) {
			if (!self::UpdateName($db, $user, $data)) {
				return false;
			}
		}
		
		// If a password is specified, update the user's password
		if (isset($data["password"]) && isset($data["newpassword"])) {
			if (!self::UpdatePassword($db, $user, $data)) {
				return false;
			}
		}
		return true;
	}
	
	// Update the current user's name
	//	db:		The database connection
	//	user:	The current user
	//	data:	A hash array of user data which should contain the following keys:
	//			username:	The user's new username
	private static function UpdateName($db, $user, $data) {
		// Check that all required fields are present
		if (empty($data["username"])) {
			throw new Exception("Couldn't update user: field 'username' is missing or empty");
		}
		
		// Make sure the requested username isn't already in use
		if (self::CheckUserName($db, $data["username"])) {
			throw new Exception("Couldn't update user: username is already in use");
		}
		
		// Update user
		$query = $db->prepare(
			"CALL user_update(:currentuserid, :username, :password)"
		);
		$query->execute(array(
			":currentuserid" => $user->Id,
			":username" => $data["username"],
			":password" => null
		));
		$result = $query->fetchColumn();
		closeCursor($query);
		return $result;
	}
	
	// Update the current user's password
	//	db:		The database connection
	//	user:	The current user
	//	data:	A hash array of user data which should contain the following keys:
	//			password:		The user's current password
	//			newpassword:	The user's new password
	private static function UpdatePassword($db, $user, $data) {
		global $CFG;
		
		// Check that all required fields are present
		if (empty($data["password"])) {
			throw new Exception("Couldn't update user: field 'password' is missing or empty");
		}
		if (empty($data["newpassword"])) {
			throw new Exception("Couldn't update user: field 'newpassword' is missing or empty");
		}
		
		// Get the user's current password hash
		$query = $db->prepare("CALL user_getpassword_userid(:currentuserid)");
		$query->execute(array(":currentuserid" => $user->Id));
		$password = $query->fetchColumn();
		
		// Verify that the current password provided is correct
		if (password_verify($data["password"], $password)) {
			$query = $db->prepare("CALL user_update(:currentuserid, :username, :password)");
			$query->execute(array(
				":currentuserid" => $user->Id,
				":username" => null,
				":password" => password_hash(
					$data["newpassword"],
					$CFG["passwordhash"],
					["cost" => $CFG["passwordcost"]]
				)
			));
			$result = $query->fetchColumn();
			closeCursor($query);
			return $result;
		} else {
			throw new Exception("Couldn't update user: password is incorrect");
		}
	}
	
	// Try to login to a user account using the specified details and return true if successful
	//	db:		The database connection
	//	user:	The current user
	//	data:	A hash array of login data which should contain the following keys:
	//			username:	The user's name
	//			password:	The user's password
	public static function Login($db, $user, $data) {
		// Make sure there isn't a currently logged on user
		if ($user->Id != 0) {
			throw new Exception("Couldn't login: there is already a user logged on");
		}
		
		// Check that all required fields are present
		if (empty($data["username"])) {
			throw new Exception("Couldn't login: field 'username' is missing or empty");
		}
		if (empty($data["password"])) {
			throw new Exception("Couldn't login: field 'password' is missing or empty");
		}
		
		// Get the user's current password hash
		$query = $db->prepare("CALL user_login(:username)");
		$query->execute(array(":username" => $data["username"]));
		$result = $query->fetch(PDO::FETCH_ASSOC);
		closeCursor($query);
		
		// Verify that the current password provided is correct
		if ($result && password_verify($data["password"], $result["password"])) {
			$_SESSION["loggedin"] = true;
			$_SESSION["userid"] = $result["id"];
			return self::Get($db, (object)array("Id" => $result["id"]));
		}
		return false;
	}
	
	// Logs the current user out (clears session variables)
	public static function Logout() {
		$_SESSION["loggedin"] = false;
		$_SESSION["userid"] = "";
	}
}

?>