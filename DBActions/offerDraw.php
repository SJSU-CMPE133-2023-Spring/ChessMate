<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    
    $gameID = $_GET['id'];
    $color = $_GET['color'];
    echo $db->offerDraw($color, $gameID);

} else echo "error";