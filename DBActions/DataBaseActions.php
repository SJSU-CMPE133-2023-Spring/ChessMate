<?php

class DataBaseActions extends Exception
{
    public $conn;
    public static string $dbname = 'chess_server';
    public string $INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

    public function __construct()
    {

        $this->conn = mysqli_connect("localhost","root","");
        if (!$this->conn)
        {
            die('Could not connect: ' . mysqli_error());

        }
        try {
            $this->conn = mysqli_connect("localhost", "root", "", DatabaseActions::$dbname); // creating connection with the DB
            if(!$this->conn){ //check connection
                die("Connection fails: " . mysqli_connect_error());
            }
        } catch (Exception $exception){
            $this->createTheDB();
        }


    }
    public function dropTheDb(){
        $this->conn = mysqli_connect("localhost","root","");
        mysqli_query($this->conn,"DROP DATABASE ". DatabaseActions::$dbname);
        $this->createTheDB();

    }

    public function createTheDB(){
        $this->conn = mysqli_connect("localhost","root","");
        mysqli_query($this->conn,"CREATE DATABASE ". DatabaseActions::$dbname);
        $this->conn = mysqli_connect("localhost", "root", "", DataBaseActions::$dbname);
        $sql = "CREATE TABLE IF NOT EXISTS `accounts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY, 
            `login` VARCHAR(255) NOT NULL, 
            `password` VARCHAR(255) NOT NULL, 
            `wins` VARCHAR(255) NOT NULL, 
            `loses` VARCHAR(255) NOT NULL, 
            `friends` VARCHAR(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $results = mysqli_query($this->conn, $sql);
        $sql = "CREATE TABLE IF NOT EXISTS `matches` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `white` varchar(255) NOT NULL,
            `black` varchar(255) NOT NULL,
            `type` varchar(255) NOT NULL,
            `position` varchar(255) NOT NULL, 
            `move_history` varchar(255) NOT NULL, 
            `date` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $results = mysqli_query($this->conn, $sql);
        $sql = "CREATE TABLE IF NOT EXISTS `stockfish_request` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `type` varchar(255) NOT NULL,
            `data` varchar(255) NOT NULL,
            `status` varchar(255) NOT NULL,
            `response` varchar(255) NOT NULL, 
            `match_id` varchar(255) NOT NULL,
            `comments` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $results = mysqli_query($this->conn, $sql);
        $sql = "CREATE TABLE IF NOT EXISTS `chat_message` (
            `type` varchar(255) NOT NULL,
            `date` varchar(255) NOT NULL,
            `match_id` varchar(255) NOT NULL,
            `sender` varchar(255) NOT NULL,
            `receiver` varchar(255) NOT NULL, 
            `content` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $results = mysqli_query($this->conn, $sql);

        //Potential way to enter initial data to the table

        $sql = "INSERT INTO `accounts` (`login`, `password`, `wins`,`loses`, `friends` ) VALUES ('Spect', 'pass', '999', '111', '? - list of IDs?');";
        $results = mysqli_query($this->conn, $sql);

    }

    public function startMatch($player1_id, $player2_id, $gameType){
        $date = date("Y-m-d h:i:sa");
        //randomly assign the colors

        //$randBool = (bool) mt_rand(0, 1);
        if (mt_rand(0, 1))
        $sql = "INSERT INTO `matches` (`white`, `black`, `type`,`position`, `move_history`, `date`) 
VALUES ('$player1_id', '$player2_id', '$gameType', '$this->INITIAL_POSITION', '', '$date');";
        $results = mysqli_query($this->conn, $sql);
    }

    public function makeMove($gameID, $newPosition, $lastMove){ //actually this can be something like DBRequest with request id: 1 for makeMove, 2 for give a hint, etc.

        //update the history of the moves
        $history = $this->getMoveHistory($gameID)." ".$lastMove;
        if ($history[0] == " ") $history = $lastMove;

        $stmt = $this->conn->prepare("UPDATE matches SET position=?, move_history=? WHERE id=?");
        $stmt->bind_param("ssi", $newPosition, $history, $gameID);
        $stmt->execute();

    }

    private function getMoveHistory($id){
        $sql = "SELECT * FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->move_history;
    }

    public function getPosition($id){
        $sql = "SELECT * FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->position;
    }

    public function getLastMove($id): string
    {
        $movesArr = explode(" ", $this->getMoveHistory($id));
        return end($movesArr);
    }


    

}