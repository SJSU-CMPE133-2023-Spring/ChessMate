<?php
require_once('DataBaseActions.php');
$db = new DataBaseActions();

$db->dropTheDb();
echo "The database is updated!";