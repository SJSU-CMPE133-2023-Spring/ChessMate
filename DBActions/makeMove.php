<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    $newPosition = $_GET['position']; // the "/" symbol is special and cannot be entered in the db directly, so:

    $lastMove = $_GET['lastMove'];

    if($lastMove!="") $db->makeMove($gameID, $newPosition, $lastMove);

    while($lastMove == $db->getLastMove($gameID)) usleep(500);

//     echo $db->getPositionAndLastMoveAndCaptured($gameID);
    echo $db->getLastPositionAndMove($gameID);
    
} else echo "error";
