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

    public $PLAYER_STATUS_OFFLINE = "offline";
    public $PLAYER_STATUS_ONLINE = "online";
    public $PLAYER_STATUS_PLAYING = "playing";
    public $WRONG_PASSWORD_MESSAGE = "Wrong login or password! Please check the spelling.";
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
            `status` VARCHAR(255) NOT NULL,
            `wins` VARCHAR(255) NOT NULL,
            `loses` VARCHAR(255) NOT NULL,
            `rating` VARCHAR(255) NOT NULL,
            `icon` VARCHAR(255) NOT NULL,
            `friends` VARCHAR(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $results = mysqli_query($this->conn, $sql);
        $sql = "CREATE TABLE IF NOT EXISTS `matches` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `white` varchar(255) NOT NULL,
            `black` varchar(255) NOT NULL,
            `status` varchar(255) NOT NULL,
            `type` varchar(255) NOT NULL,
            `position` varchar(255) NOT NULL,
            `result` varchar(255) NOT NULL,
            `move_history` varchar(1255) NOT NULL,
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

        $sql = "INSERT INTO `accounts` (`login`, `password`, `status`, `wins`,`loses`, `rating`,`icon`, `friends` ) VALUES ('Mike', 'pass','$this->PLAYER_STATUS_OFFLINE', '999', '111', '1000','img-1.png', '? - list of IDs?');";
        $results = mysqli_query($this->conn, $sql);

    }
    public function accountExists($login){
        $sql = "SELECT * FROM accounts WHERE login='$login'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row!=null)return true;
        else return false;
    }
    public function register($login, $password){
        if($this->accountExists($login)) return false;
        $sql = "INSERT INTO `accounts` (`login`, `password`, `status`, `wins`,`loses`, `rating`,`icon`, `friends` ) VALUES ('$login', '$password','$this->PLAYER_STATUS_ONLINE', '0', '0', '500','img-2.png', '');";
        $result = mysqli_query($this->conn, $sql);
        return true;
    }


    public function login($login, $password){
        $sql = "SELECT * FROM accounts WHERE (login='$login' AND password='$password')";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row!=null)return $row->id;
        else return $this->WRONG_PASSWORD_MESSAGE;
    }
    public function startMatch($player1_id, $player2_id, $gameStatus, $type){
        $date = date("Y-m-d h:i:sa");


        $sql = "INSERT INTO `matches` (`white`, `black`, status,`position`, `move_history`, `date`, `result`,`type`)
VALUES ('$player1_id', '$player2_id', '$gameStatus', '$this->INITIAL_POSITION', '', '$date','', '$type');";
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

    private function getMoveHistory($id) {
        // Set the maximum execution time for the script to a higher value
    // to avoid timeouts. The value is in seconds (e.g., 300 seconds = 5 minutes)
    ini_set('max_execution_time', 300);

    $sql = "SELECT * FROM matches WHERE id=$id";
    $result = mysqli_query($this->conn, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_object($result);
        return $row->move_history;
    } else {
        // Handle the case where no row was found or a player didn't make a move within the time limit
        // You can return an error message or a default value, depending on your application's requirements
        return "No move found or timed out";
    }
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


    public function enterOrStartGame($playerID, $type){

        $randBool = (bool) mt_rand(0, 1);
        if ($type == "classic"){
            // online opponent
            return $this->enterOrStartOnlineGame($playerID, $type);
        }
        if ($type == "ranked"){
            // TODO: make this code make a ranked game
            return $this->enterOrStartOnlineGame($playerID, $type);
        }
        if ($type == "engine"){
            // engine opponent

            if ($randBool) $this->startMatch($playerID, "engine", "waiting_engine", $type);
            else  $this->startMatch("engine", $playerID, "waiting_engine", $type);
            $sql = "SELECT * FROM matches WHERE status='$this->STATUS_WAITING_ENGINE' AND (white = $playerID OR black = $playerID)";
            $result = mysqli_query($this->conn, $sql);
            $row = mysqli_fetch_object($result);
            return $row->id;
        }

    }
    public function enterOrStartOnlineGame($playerID, $type){
        $randBool = (bool) mt_rand(0, 1);
        $sql = "SELECT * FROM matches WHERE status='$this->STATUS_WAITING_OPPONENT' AND type='$type'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row == null){
            //no waiting lobbies - create one
            $this->startMatch($playerID, "", $this->STATUS_WAITING_OPPONENT, $type);
            $result = mysqli_query($this->conn, $sql);
            $row = mysqli_fetch_object($result);
        } else {
            //there is a lobby with one player - join
            //check if player is not you
            //if ($this->findLobbyByPlayerID($playerID)!==null) return null;


            //randomly assign the colors

            $player1 = $playerID;
            $player2 = $row->white;

            $gameID = $row->id;
            if ($randBool) $this->updateGame($gameID, $player1, $player2);
            else  $this->updateGame($gameID, $player2, $player1);
        }
        return $row->id;
    }

    //returns data for the profiles in the following order: White's name&rating&icon and then the same data for black to split in array with (&).
    public function getGameData($gameID){
        $sql = "SELECT * FROM matches WHERE id='$gameID'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $this->getPlayerNameRatingIcon($row->white)."&".$this->getPlayerNameRatingIcon($row->black);
    }

    //returns Players Name, Rating and Icon separated by "&"
    public function getPlayerNameRatingIcon($playerID){
        if ($playerID=="engine") return "Stockfish Engine&???&stockfish.png";
        if ($playerID>100) return "Guest&500&emote.png";

        $sql = "SELECT * FROM accounts WHERE id='$playerID'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->login."&".$row->rating."&".$row->icon;
    }

    public function getGameStatus($id){
        $sql = "SELECT * FROM matches WHERE id='$id'";
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
        $sql = "SELECT * FROM matches WHERE id='$id'";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if ($row->white==$playerID) return "white";
        if ($row->black==$playerID) return "black";
        //return -1;
    }

    public function getPlayerStatus($id){
        $sql = "SELECT * FROM accounts WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->status;
    }

    public function findGameByPlayerID($id){
        $sql = "SELECT * FROM matches WHERE status=$this->STATUS_STARTED AND (black=$id OR white=$id)";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->id;
    }

    public function findLobbyByPlayerID($id){
        $sql = "SELECT * FROM matches WHERE status=$this->STATUS_WAITING_OPPONENT AND (black=$id OR white=$id)";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        return $row->id;
    }

    public function changePlayerStatus($id, $status){
        $sql = "UPDATE accounts SET status = $status WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
    }

    public function finishGame($id){
        $sql = "UPDATE matches SET status = '$this->STATUS_FINISHED' WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);

        //update players' statuses:
        $sql = "SELECT * FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);

        //if($row->white < 100)$this->changePlayerStatus($row->white, $this->PLAYER_STATUS_PLAYING);
        //if($row->black < 100)$this->changePlayerStatus($row->black, $this->PLAYER_STATUS_PLAYING);
    }

    public function deleteGame($id){
        $sql = "DELETE FROM matches WHERE id=$id";
        $result = mysqli_query($this->conn, $sql);
    }

    public function offerDraw($color, $gameID){
        $sql = "SELECT * FROM matches WHERE id=$gameID";
        $result = mysqli_query($this->conn, $sql);
        $row = mysqli_fetch_object($result);
        if (($color ==="white" AND $row->result==="draw offer from black")
        OR ($color==="black" AND $row->result==="draw offer from white")){
            $sql = "UPDATE matches SET result = 'draw' WHERE id=$gameID";
            $result = mysqli_query($this->conn, $sql);
            return "draw";
        }
        if ($row->result ==="draw") return "draw";
        if ($row->result === "" AND $color==="white") $sql = "UPDATE matches SET result = 'draw offer from white' WHERE id=$gameID";
        if ($row->result === "" AND $color==="black") $sql = "UPDATE matches SET result = 'draw offer from black' WHERE id=$gameID";
        $result = mysqli_query($this->conn, $sql);
        return "-";
}
    // For leaderboard table
    public function getPlayersSortedByRating() {
        $sql = "SELECT * FROM accounts ORDER BY rating ASC";
        $result = mysqli_query($this->conn, $sql);
        $players = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $players[] = [
                'id' => $row['id'],
            'icon' => $row['icon'],
            'login' => $row['login'],
            'rating' => $row['rating']
        ];
        }

    return json_encode($players);

}
