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
	RELEASE_END-->
	<!--DEBUG_START-->
	<link rel="stylesheet/less" type="text/css" href="styles/main.less">
	<script type="text/javascript" src="scripts/common/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="scripts/common/less-2.1.0.min.js"></script>
	<script type="text/javascript" src="scripts/z.js"></script>
	<script type="text/javascript" src="scripts/settings.js"></script>
	<!--DEBUG_END-->
	<script type="text/javascript">
	
	// Show a message/error message
	var message = function(text, error) {
			$(".messages").append(
				$("<div class='message'>")
				.toggleClass("error", !!error)
				.text(text)
				.click(function() { $(this).slideUp("fast", function() { $(this).remove(); }); })
				.hide()
				.fadeIn()
			);
		},
		error = function(text) { message(text, true); };
	
	// Initialise page
	$(document).ready(function() {
		// Show login/logout forms
		$.ajax({
			type: "GET",
			url: "api/v1.0/me",
			success: function(result) {
				if (result.User.Id > 0) {
					$("form.logout").addClass("show");
					$("form.logout input[type=submit]").val("Logout " + result.User.Name);
				} else {
					$("form.login").addClass("show");
				}
			},
			complete: function() { listWorlds(); }
		});
		
		// Show/hide register form
		$(".register").click(function() {
			$("form.login").removeClass("show");
			$("form.register").addClass("show");
			$("#login_username, #login_password").val("");
		});
		$(document).on("click", ".cancel-register", function() {
			$("form.register").removeClass("show");
			$("form.login").addClass("show");
			$("#register_username, #register_password1, #register_password2").val("");
		});
		
		// Register form
		$("form.register").submit(function(e) {
			e.preventDefault();
			var username = $("#register_username").val(),
				password1 = $("#register_password1").val(),
				password2 = $("#register_password2").val();
			if (password1 != password2) {
				error("Passwords don't match");
			} else {
				$.ajax({
					type: "POST",
					url: "api/v1.0/users",
					dataType: "json",
					data: JSON.stringify({ username: username, password: password1 }),
					success: function(result) {
						$("form.register").removeClass("show");
						$("form.logout").addClass("show");
						$("form.logout input[type=submit]").val("Logout " + result.User.Name);
						$("#register_username, #register_password1, #register_password2").val("");
						message("User registered successfully");
						listWorlds();
					},
					error: function() { error("User creation failed"); }
				});
			}
		});
		
		// Login form
		$("form.login").submit(function(e) {
			e.preventDefault();
			var username = $("#login_username").val(),
				password = $("#login_password").val();
			$.ajax({
				type: "POST",
				url: "api/v1.0/login",
				dataType: "json",
				data: JSON.stringify({ username: username, password: password }),
				success: function(result) {
					$("form.login").removeClass("show");
					$("form.logout").addClass("show");
					$("form.logout input[type=submit]").val("Logout " + result.User.Name);
					$("#login_username, #login_password").val("");
					message("Login success");
					listWorlds();
				},
				error: function() { error("Login failed"); }
			});
		});
		
		// Logout form
		$("form.logout").submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "api/v1.0/logout",
				success: function() {
					$("form.login").addClass("show");
					$("form.logout").removeClass("show");
					message("Logged out");
					listWorlds();
				}
			});
		});
	});
	
	// Get a page of worlds
	var getWorldsPage = function(page, finished) {
		$.ajax({
			type: "GET",
			url: "api/v1.0/worlds?page=" + (page || 1),
			success: function(result) {
				if (result) {
					finished(result.Pages, result.Worlds);
				} else {
					finished(1, []);
				}
			}
		});
	};
	
	// Get all worlds
	var getWorlds = function(finishedAll) {
		var worlds = [],
			pages = 1,
			page = 1,
			finished = function(p, w) {
				worlds.push.apply(worlds, w);
				pages = p;
				if (page < pages) {
					page++;
					getWorldsPage(++page, finished);
				} else {
					finishedAll(worlds);
				}
			};
		getWorldsPage(page, finished);
	};
	
	// Show a list of worlds on the page
	var listWorlds = function() {
		getWorlds(function(worlds) {
			$(".worlds").empty();
			if (!worlds.length) {
				message("No worlds");
			} else {
				for (var i = 0, length = worlds.length; i < length; i++) {
					var id = worlds[i].Id;
					$(".worlds").append(
						$("<div class='world'>")
						.append(
							$("<a href='index.php?id=" + id + "' target='_blank'>")
							.text(worlds[i].Name)
						)
						.append(" by " + worlds[i].UserName)
						.append(worlds[i].Id == Z.settings.defaultWorld ? " (default) " : " ")
						.append(
							$("<a href='editor.php?id=" + id + "' target='_blank' class='editbutton'>")
						)
						.append(
							$("<a href='javascript:copyWorld(\"" + id + "\")' class='copybutton'>")
						)
						.append(
							$("<a href='javascript:deleteWorld(\"" + id + "\")' class='deletebutton'>")
						)
					);
				}
			}
			$(".worlds").append(
				$("<a href='editor.php' target='_blank'>").text("Create new world")
			);
		});
	};
	
	// Remove a world
	var deleteWorld = function(id) {
		$.ajax({
			type: "DELETE",
			url: "api/v1.0/worlds/" + id,
			success: function() {
				message("World deleted");
				listWorlds();
			},
			error: function() {
				error("Couldn't delete world");
			}
		});
	};
	
	// Copy a world
	var copyWorld = function(id) {
		$.ajax({
			type: "GET",
			url: "api/v1.0/worlds/" + id,
			success: function(result) {
				// Re-post the world back to the API
				$.ajax({
					type: "POST",
					url: "api/v1.0/worlds",
					dataType: "json",
					data: JSON.stringify({
						name: result.World.Name + " copy",
						description: result.World.Description,
						private: result.World.Private ? "true" : "false",
						data: result.World.Data
					}),
					success: function() {
						message("World copied");
						listWorlds();
					},
					error: function() {
						error("Couldn't copy world");
					}
				});
			},
			error: function() {
				error("Couldn't get world data");
			}
		});
	};
	
	</script>
	<style>
	
	body {
		overflow: auto;
		background-color: #ddd;
		color: black;
	}
	
	.page-list {
		padding: 20px;
	}
	
	a:link,
	a:active,
	a:visited {
		color: black;
		text-decoration: none;
	}
	
	a:hover {
		text-decoration: underline;
	}
	
	hr {
		height: 2px;
		border: none;
		background-color: rgba(0, 0, 0, 0.5);
		margin: 20px 0px;
	}
	
	form {
		display: none;
	}
	
	form.show {
		display: block;
	}
	
	.message {
		background-color: #38e;
		border-radius: 2px;
		margin-bottom: 10px;
		font-weight: bold;
		color: white;
		padding: 5px 5px 5px 30px;
		background-image: url(images/editor/icons.png);
		background-repeat: no-repeat;
		background-position: 0px -330px;
	}
	
	.message.error {
		background-color: #f40;
		background-position: 0px -360px;
	}
	
	input[type=submit] {
		border: none;
		background-color: #333;
		border-radius: 2px;
		padding: 3px 5px;
		margin: 0px 2px;
		height: 28px;
		color: white;
		font: bold 10pt "Open Sans", sans-serif;
		cursor: pointer;
	}
	
	input[type=submit]:hover {
		background-color: #444;
	}
	
	.world {
		position: relative;
		background-color: rgba(0, 0, 0, 0.1);
		margin-bottom: 10px;
		font-weight: normal;
		color: black;
		padding: 5px 5px 5px 10px;
		height: 20px;
	}
	
	.world a {
		font-weight: bold;
	}
	
	.editbutton {
		position: absolute;
		top: 0px;
		right: 60px;
		display: inline-block;
		width: 30px;
		height: 30px;
		background-color: #666;
		background-image: url(images/editor/icons.png);
		background-repeat: no-repeat;
		background-position: 0px -840px;
		opacity: 0.5;
	}
	
	.editbutton:hover {
		opacity: 1;
	}
	
	.copybutton {
		position: absolute;
		top: 0px;
		right: 30px;
		display: inline-block;
		width: 30px;
		height: 30px;
		background-color: #666;
		background-image: url(images/editor/icons.png);
		background-repeat: no-repeat;
		background-position: 0px -810px;
		opacity: 0.5;
	}
	
	.copybutton:hover {
		opacity: 1;
	}
	
	.deletebutton {
		position: absolute;
		top: 0px;
		right: 0px;
		display: inline-block;
		width: 30px;
		height: 30px;
		background-color: #f40;
		background-image: url(images/editor/icons.png);
		background-repeat: no-repeat;
		background-position: 0px -360px;
		opacity: 0.5;
	}
	
	.deletebutton:hover {
		opacity: 1;
	}
	
	</style>
</head>
<body>
	<div class="page-list">
		<div class="messages"></div>
		<div class="user">
			<form class="login">
				<input type="text" id="login_username" placeholder="Username">
				<input type="password" id="login_password" placeholder="Password">
				<input type="submit" value="Login">
				<a href="javascript:void(0)" class="register">Register</a>
			</form>
			<form class="register">
				<input type="text" id="register_username" placeholder="Username">
				<input type="password" id="register_password1" placeholder="Password">
				<input type="password" id="register_password2" placeholder="Password">
				<input type="submit" value="Register">
				<a href="javascript:void(0)" class="cancel-register">Cancel</a>
			</form>
			<form class="logout">
				<input type="submit" value="Logout">
			</form>
		</div>
		<hr>
		<div class="worlds"></div>
	</div>
</body>
</html>