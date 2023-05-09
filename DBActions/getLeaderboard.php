<?php

require_once('DataBaseActions.php');
$db = new DataBaseActions();
echo $db->getPlayersSortedByRating();