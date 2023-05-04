<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();

if($_POST){
    //make find match logic
    $login = $_POST['login'];
    $password = $_POST['password'];
    $operation = $_POST['operation'];

    if ($operation==="login") echo $db->login($login, $password);
    else echo $db->register($login, $password);
       
} else echo "error";