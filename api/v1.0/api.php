<?php

final class Api {
	public $Database = null,
		$Order = "",
		$Descending = null,
		$Page = 1,
		$PageSize = 1,
		$User = null,
		$Data = null,
		$Paths = array();
	
	private $routes = array(),
		$output = null;
	
	public function __construct() {
		global $CFG;
		error_reporting(E_ALL | E_STRICT);
		set_exception_handler(array("Api", "handleException"));
		date_default_timezone_set($CFG["timezone"]);
		
		// Get ordering/paging parameters
		$this->Order = !empty($_GET["order"]) ? $_GET["order"] : "";
		$this->Page = (!empty($_GET["page"]) && is_numeric($_GET["page"])) ? $_GET["page"] : 1;
		$this->PageSize = $CFG["pagesize"];
		
		// Check for ascending/descending order
		if (isset($_GET["descending"])) {
			$this->Descending = true;
		} elseif (isset($_GET["ascending"])) {
			$this->Descending = false;
		} else {	// If neither are set, use null (will default to object default)
			$this->Descending = null;
		}
		
		// Connect to database
		$this->Database = new PDO(
			"mysql:host={$CFG['dbhost']};dbname={$CFG['dbname']}",
			$CFG["dbuser"],
			$CFG["dbpass"]
		);
		
		// Parse data as a JSON object (if there is any data)
		$data = file_get_contents("php://input");
		if ($data) {
			$this->Data = json_decode($data, true);
		}
		
		// Check session or basic authentication for current user
		$this->User = $this->Authenticate();
	}
	
	// Checks the current session and basic authentication and returns a user if one is logged in
	private function Authenticate() {
		// If a session exists with a user id, get the user from the database
		if (!empty($_SESSION["loggedin"]) && !empty($_SESSION["userid"])) {
			return User::Get($this->Database, (object)array("Id" => $_SESSION["userid"]));
		
		// Otherwise, check basic authentication
		} elseif (!empty($_SERVER["PHP_AUTH_USER"]) && !empty($_SERVER["PHP_AUTH_PW"])) {
			$user = User::Login(
				$this->Database,
				(object)array("Id" => 0),
				array(
					"username" => $_SERVER["PHP_AUTH_USER"],
					"password" => $_SERVER["PHP_AUTH_PW"]
				)
			);
			if ($user) {
				return $user;
			}
		}
		
		// Return guest user if no user was found in the session or basic auth
		return User::Guest();
	}
	
	// Adds a route to the API
	//	path:		The URL path to detect. Can have parameters enclosed in { and } which
	//				get passed to the callback in the order they appear in the path
	//	method:		The connection method - either GET, POST, PUT or DELETE
	//	callback:	A callback function, should take either no arguments or arguments corresponding
	//				to parameters in the path and return an object that will be sent to the client
	public function AddRoute($path, $method, $callback) {
		$this->routes[] = array(
			"path" => $path,
			"method" => $method,
			"callback" => $callback
		);
		$this->Paths[] = "$method $path";
	}
	
	// Processes the current request using the first matched path
	public function ProcessRequest() {
		$path = trim(str_ireplace(dirname($_SERVER["SCRIPT_NAME"]), "", $_SERVER["REQUEST_URI"]), "/");
		if ($_SERVER["QUERY_STRING"]) {
			$path = str_replace("?" . $_SERVER["QUERY_STRING"], "", $path);
		}
		$method = $_SERVER["REQUEST_METHOD"];
		foreach ($this->routes as $route) {
			$args = $this->MatchPath($route["path"], $path);
			if ($args !== false && strtolower($method) == strtolower($route["method"])) {
				$this->output = call_user_func_array($route["callback"], $args);
				return;
			}
		}
		
		// No path was matched, so return bad request error to client
		throw new Exception("Unknown request", 400);
	}
	
	// Match a path to a route
	//	route:		The route path
	//	path:		The current request path
	//	returns:	An array of parameter values if the route matches the path otherwise false
	private function MatchPath($route, $path) {
		$pathParts = explode("/", $path);
		$routeParts = explode("/", $route);
		if (count($pathParts) == count($routeParts)) {
			$args = array();
			for ($i = 0; $i < count($routeParts); $i++) {
				if (preg_match("/^\{.+\}$/", $routeParts[$i])) {
					$args[] = $pathParts[$i];
				} elseif ($pathParts[$i] != $routeParts[$i]) {
					return false;
				}
			}
			return $args;
		}
		return false;
	}
	
	// Handle exceptions - send an error code and message as a JSON object
	public static function handleException(Exception $e) {
		$code = $e->getCode();
		$message = $e->getMessage();
		header("HTTP/1.1 $code $message");
		header('Content-type: application/json');
		die(json_encode(array("Code" => $code, "Message" => $message)));
	}
	
	// Writes the requested content as a stringified JSON object
	public function __toString() {
		return json_encode($this->output);
	}
}

?>