<?php

class DatabaseActions {
    public static $dbname = "chess_server";
    private $conn;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        $this->conn = mysqli_connect("localhost", "root", "", self::$dbname);

        if (!$this->conn) {
            die("Connection failed: " . mysqli_connect_error());
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}

$db = new DatabaseActions();
$conn = $db->getConnection();

// Insert data into accounts table
$insertAccounts = "INSERT INTO `accounts` (`login`, `password`, `status`, `wins`, `loses`, `rating`, `icon`, `friends`) VALUES ('test_user', 'test_password', 'active', '0', '0', '1200', 'default.png', '')";
$resultAccounts = mysqli_query($conn, $insertAccounts);

if ($resultAccounts) {
    $lastAccountId = mysqli_insert_id($conn);
}

// Insert data into matches table
$insertMatches = "INSERT INTO `matches` (`white`, `black`, `status`, `type`, `position`, `move_history`, `date`) VALUES ('test_user1', 'test_user2', 'ongoing', 'standard', 'start_position', '', '2023-05-09')";
$resultMatches = mysqli_query($conn, $insertMatches);

if ($resultMatches) {
    $lastMatchId = mysqli_insert_id($conn);
}

// Check if both inserts are successful
if ($resultAccounts && $resultMatches) {
    echo "<p style='font-size:4vh'> Insertion successful. Account ID: " . $lastAccountId . " | Match ID: " . $lastMatchId . "\n</p>";

    // Remove test data from accounts and matches tables
    $deleteAccounts = "DELETE FROM `accounts` WHERE `id` = $lastAccountId";
    $deleteMatches = "DELETE FROM `matches` WHERE `id` = $lastMatchId";

    $resultDeleteAccounts = mysqli_query($conn, $deleteAccounts);
    $resultDeleteMatches = mysqli_query($conn, $deleteMatches);

    if ($resultDeleteAccounts && $resultDeleteMatches) {
        echo "<p style='font-size:4vh'>Deletion successful. Test data removed.</p>";
    } else {
        echo "<p style='font-size:4vh'>Deletion failed. Test data not removed.</p>";
    }
} else {
    echo "<p style='font-size:4vh'>Insertion failed.</p>";
}

mysqli_close($conn);

?>
