<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    $gameID = $_GET['id'];
    $result = floatval($_GET['result']);
    $color = $_GET['color'];
    echo $db->getRatingChange($gameID, $result, $color);
} else echo "error";