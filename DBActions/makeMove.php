<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    $newPosition = $_GET['position']; // the "/" symbol is special and cannot be entered in the db directly, so:

    $lastMove = $_GET['lastMove'];

    if($lastMove!="") $db->makeMove($gameID, $newPosition, $lastMove);

    while($lastMove == $db->getLastMove($gameID)) usleep(500);

    echo $db->getLastMove($gameID);

    //this method can be upgraded later with request id: 1 for make a move, 2 for give a hint, 3 for estimation of the position and so on
    /*
    if($_GET['status']==1){
        $email = $_GET['email'];
        $pin = $_GET['pin'];
        echo $db->atmLogin($email, $pin);
    }
    */
} else echo "error";
