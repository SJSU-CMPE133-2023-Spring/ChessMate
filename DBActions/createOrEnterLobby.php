<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    //make find match logic
    $playerID = $_GET['id'];
    $gameType = $_GET['type'];
    $gameID = $db->enterOrStartGame($playerID, $gameType);
    if ($gameID===null) {
        echo "error";
        return;
    }
    $gameStatus = $db->getGameStatus($gameID);
    if ($gameStatus==="waiting") echo $gameID."&waiting";
    else if ($gameStatus==="ready") echo $gameID."&ready&".$db->getPlayerColor($gameID, $playerID);

} else echo "error";