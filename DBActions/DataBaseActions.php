<?php

class DataBaseActions extends Exception
{
    public $conn;
    public static string $dbname = 'chess_server';
    public string $INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
    public $STATUS_STARTED = "started";
    public $STATUS_FINISHED = "finished";
    public $STATUS_ABORTED = "aborted";
    public $STATUS_WAITING_OPPONENT = "waiting_opponent";
    public $STATUS_WAITING_ENGINE = "waiting_engine";

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
            `status` varchar(255) NOT NULL,
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

    public function startMatch($player1_id, $player2_id, $gameStatus){
        $date = date("Y-m-d h:i:sa");


        $sql = "INSERT INTO `matches` (`white`, `black`, status,`position`, `move_history`, `date`) 
VALUES ('$player1_id', '$player2_id', '$gameStatus', '$this->INITIAL_POSITION', '', '$date');";
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

    public function getLastPositionAndMove($id): string{
        $movesArr = explode(" ", $this->getMoveHistory($id));
        return $this->getPosition($id)."&".end($movesArr);
    }

    public function enterOrStartGame($playerID, $opponent){

        $randBool = (bool) mt_rand(0, 1);
        if ($opponent == "online"){
            //online opponent
            return $this->enterOrStartOnlineGame($playerID);
        } else {
            // engine opponent

            if ($randBool) $this->startMatch($playerID, "engine", "waiting_engine");
            else  $this->startMatch("engine", $playerID, "waiting_engine");
            $sql = "SELECT * FROM matches WHERE status='$this->STATUS_WAITING_ENGINE' AND (white = $playerID OR black = $playerID)";
            $result = mysqli_query($this->conn, $sql);
            $row = mysqli_fetch_object($result);
            return $row->id;
        }

    }
    public function enterOrStartOnlineGame($playerID){
        $randBool = (bool) mt_rand(0, 1);
        $sql = "SELECT * FROM matches WHERE status='$this->STATUS_WAITING_OPPONENT'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row == null){
            //no waiting lobbies - create one
            $this->startMatch($playerID, "", $this->STATUS_WAITING_OPPONENT);
            $result = mysqli_query($this->conn, $sql);
            $row = mysqli_fetch_object($result);
        } else {
            //there is a lobby with one player - join
            //randomly assign the colors

            $player1 = $playerID;
            $player2 = $row->white;

            $gameID = $row->id;
            if ($randBool) $this->updateGame($gameID, $player1, $player2);
            else  $this->updateGame($gameID, $player2, $player1);
        }
        return $row->id;
    }

    public function getGameStatus($id){
        $sql = "SELECT * FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row->status == $this->STATUS_WAITING_OPPONENT or $row->status == $this->STATUS_WAITING_ENGINE) return "waiting";
        else return "ready";
    }

    private function updateGame($id, $player1, $player2){
        $sql = "UPDATE matches SET white = '$player1', black = '$player2', status = '$this->STATUS_STARTED' WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
    }

    public function getPlayerColor($id, $playerID){
        $sql = "SELECT * FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row->white==$playerID) return "white";
        if ($row->black==$playerID) return "black";
        //return -1;
    }


}