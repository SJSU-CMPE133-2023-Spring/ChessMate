<?php
require_once('DBActions/DataBaseActions.php');
$db = new DataBaseActions();

if ($_GET and $_GET["id"] and $_GET["login"]){

    $opponent = $_GET["opponent"];
    echo $opponent;
    $gameID = $db->enterOrStartGame($_GET["id"],$_GET["opponent"]);
    while ($db->getGameStatus($gameID) == "waiting") sleep(1);
    $color = $db->getPlayerColor($gameID, $_GET["id"]);

    if ($color == -1) {
        echo "error with the lobby";
        die();
    }
    header("location: board.php?gameid=$gameID&color=$color");
    die();

}

?>

<!DOCTYPE html>
<html>
<head>
    <title>Waiting Lobby</title>
    <style>
        body {
            background-color: #f2f2f2;
            font-family: Arial, sans-serif;

        }
        form {
            background-color: #fff;
            justify-content: center;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
            margin: auto;
            width: 50%;
            margin-top: 50px;

        }
        h1 {
            text-align: center;
        }
        input[type=text], input[type=email] {
            width: 100%;
            padding: 12px 20px;
            margin: 8px 0;
            display: inline-block;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        input[type=submit] {
            background-color: #4CAF50;
            color: white;
            padding: 14px 20px;
            margin: 8px 0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        input[type=submit]:hover {
            background-color: #45a049;
        }
        img {
            display:block;
            margin:auto;
            width:auto;
            height:auto;
            max-width:none;
            max-height:none;
            margin-top:50px;
            margin-bottom:-50px;
            position:relative;
            z-index:-1
        }
        label {
            margin-right: 10px;
        }

    </style>
</head>
<body>

<img id="icon" src="icon.png">
<form id="form" action="lobby.php">
    <label for="fname">Login</label>
    <input type="text" id="fname" name="login" placeholder="Your login..">

    <label for="lname">ID</label>
    <input type="text" id="lname" name="id" placeholder="Your id..">


    <input type="radio" name="opponent" value="online">Online
    <input type="radio" name="opponent" value="engine">With a bot
    <br>
    <input class="center" onclick="displayWait()" type="submit" value="Submit">
</form>

<h1 id="wait-label" style="display: none"> Waiting for an opponent</h1>
<img id="wait-gif" style="display: none" src="wait.gif">

</body>
</html>
<script>
    function displayWait(){
        document.getElementById("form").style.display='none';
        document.getElementById("icon").style.display='none';

        document.getElementById("wait-label").style.display='block';
        document.getElementById("wait-gif").style.display='block';
    }
</script>