<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    $status = $_GET['status'];
    $db->setGameStatus($gameID, $status);
} else echo "error";