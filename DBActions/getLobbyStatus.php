<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    //make find match logic
    $gameID = $_GET['gameId'];
    $playerID = $_GET['playerId'];
    $gameStatus = $db->getLobbyStatus($gameID);
    if ($gameStatus==="waiting") echo $gameID."&waiting";
    else echo $gameID."&ready&".$db->getPlayerColor($gameID, $playerID);

} else echo "error";