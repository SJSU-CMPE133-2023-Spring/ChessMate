<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_GET){
    //make find match logic
    $login = $_GET['login'];
    $password = $_GET['password'];
    $operation = $_GET['operation'];
    if ($operation==="login") return $db->login($login, $password);
    else $db->register($login, $password);
       
} else echo "error";