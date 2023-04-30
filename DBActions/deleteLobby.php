<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    $db->deleteGame($gameID);

} else echo "error";