<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    echo $db->getGameStatus($gameID);
} else echo "error";