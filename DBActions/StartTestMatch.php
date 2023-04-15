<?php
require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){

} else $db->startMatch(0, 1, "classic");
