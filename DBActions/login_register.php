<?php
require_once('DataBaseActions.php');
$db = new DataBaseActions();

if ($_GET) {
    if ($_GET['operation'] == "login") {
        echo $db->login($_GET['login'], $_GET['password']);
    }
    if ($_GET['operation'] == "registration") {
        if($db->register($_GET['login'], $_GET['password'])===false) echo "This login is already taken!";
        else echo $db->login($_GET['login'], $_GET['password']);
    }
} else {
    echo "error :(";
}
