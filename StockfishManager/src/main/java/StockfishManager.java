import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;
import java.util.Random;

public class StockfishManager {
    // it will not create a connection
    static MysqlConnect mysqlConnect = new MysqlConnect();
    static ProcessBuilder pb;
    static BufferedReader reader;
    static Process p;
    static OutputStream stdin;
    static InputStream stderr;
    static InputStream stdout;
    static BufferedWriter writer;
    public StockfishManager(){
        setupStockfish();
    }
    public static void main(String[] args) {

        // connect to the Engine
        StockfishManager manager = new StockfishManager();

        // do engine calls here:
        //printMatches();
        while (true){
            manager.joinGames();
            manager.playEngineMoves();
            //System.out.println(manager.evaluatePosition("e2e4 d7d5 e4d5 d8d5 b1c3 d5d8 d2d3 e7e5 c1d2 b8c6 f1e2 g8e7 f2f3 e7f5 g1h3 f5h4 e1g1 c8h3 g2h3 d8d7 d2g5 d7h3 f1f2 f8c5 d3d4 c5d4 d1f1 h4f3 g1h1 h3f1 f2f1 f3g5 e2b5 h7h6 c3d5", false));
            System.out.println(manager.evaluatePosition("r3k2r/ppp2pp1/2n4p/1B1Np1n1/3b4/8/PPP4P/R4R1K b kq - 1 17", true));

            /*
            * position estimation can be triggered with "eval"
              -0.4 is inaccuracy
              -0.9 is a mistake
              -2.0 is a blunder
            * all legal moves can be listed with
                position startpos moves e2e4 e7e5
                go perft 1
            * this can be useful to get a list of legal moves and play a random one,
            * or get a list of moves, get a couple of random ones and pick the best one by evaluating the position
            */
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println("The action queue is empty. Updating the queue...");
        }


    }

    private void setupStockfish(){
        try {
            String exeResourcePath = "/stockfish-windows-2022-x86-64-avx2.exe";
            InputStream exeInputStream = StockfishManager.class.getResourceAsStream(exeResourcePath);

            // Create a temporary file to store the executable
            Path tempExePath = Files.createTempFile("stockfish", ".exe");
            Files.copy(exeInputStream, tempExePath, StandardCopyOption.REPLACE_EXISTING);

            // Start the process using the ProcessBuilder
            ProcessBuilder pb = new ProcessBuilder(tempExePath.toString());
            p = pb.start();
            stdin = p.getOutputStream();
            stderr = p.getErrorStream();
            stdout = p.getInputStream();

            reader = new BufferedReader(new InputStreamReader(stdout));
            writer = new BufferedWriter(new OutputStreamWriter(stdin));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void printMatches(){

        String query = "SELECT * FROM matches";
        try (PreparedStatement preparedStatement = mysqlConnect.connect().prepareStatement(query)) {

            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                System.out.println(resultSet.getInt("id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

    }
    public void playEngineMoves(){

        //When adding difficulty levels - replace 'engine' with engine_difficulty level or something like that
        String query = "SELECT * FROM matches WHERE white = 'engine' OR black = 'engine'";

        try (PreparedStatement preparedStatement = mysqlConnect.connect().prepareStatement(query)) {

            ResultSet resultSet = preparedStatement.executeQuery();

            while (resultSet.next()) {
                String fen = resultSet.getString("position");
                int moveOrder = resultSet.getString("move_history").split(" ").length;
                int gameID = resultSet.getInt("id");

                // if the number of moves is even - it's white's move, otherwise - black
                String playerToMove = (moveOrder % 2 == 0) ? "white" : "black";
                String engineColor = (resultSet.getString("white").equals("engine")) ? "white" : "black";

                // if it is engine's turn to move - make a move
                if (playerToMove.equals(engineColor)) {
                    // 500 here is time for the engine to think. More for better output
                    String bestMove = getBestMove(fen, 1);
                    String moves = resultSet.getString("move_history")+ " "+bestMove;
                    query = "UPDATE matches SET move_history = '"+moves+"' WHERE id = "+gameID;
                    PreparedStatement preparedStatement2 = mysqlConnect.connect().prepareStatement(query);
                    preparedStatement2.executeUpdate();
                    System.out.printf("Engine: made move %s in game (id = %d).\n", bestMove, gameID);

                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    public void joinGames(){
        String query = "SELECT * FROM matches WHERE status = 'waiting_engine'";
        try (PreparedStatement preparedStatement = mysqlConnect.connect().prepareStatement(query)) {

            ResultSet resultSet = preparedStatement.executeQuery();

            while (resultSet.next()) {
                int gameID = resultSet.getInt("id");
                // connect to the game and make a first move if needed
                if (Objects.equals(resultSet.getString("black"), "engine")){
                    // the engine is black
                    query = "UPDATE matches SET status = 'started' WHERE id = "+gameID;
                } else {
                    // the engine is white
                    query = "UPDATE matches SET status = 'started', move_history = '"+getRandomStartingMove()+"'";
                }
                PreparedStatement preparedStatement2 = mysqlConnect.connect().prepareStatement(query);
                preparedStatement2.executeUpdate();
                System.out.println("Joined game with id = "+gameID);

            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private String getRandomStartingMove() {
        Random random = new Random(System.currentTimeMillis());
        String[] moves = {"e2e4", "d2d4", "c2c4", "g2g3", "g1f3"};
        return moves[random.nextInt(5)];
    }

    public String getBestMove(String fen, int waitTime) {
        sendCommand("position fen " + fen);
        sendCommand("go movetime " + waitTime);
        String output = getOutput(waitTime + 500);

        while (!output.contains("bestmove ")) {
            output = getOutput(200);
            System.out.println("Output read failed. Attempting again");
        }

        return output.split("bestmove ")[1].split(" ")[0];
    }

    public String getOutput(int waitTime) {
        StringBuffer buffer = new StringBuffer();
        try {
            Thread.sleep(waitTime);
            sendCommand("isready");
            while (true) {
                String text = reader.readLine();
                if (text.equals("readyok"))
                    break;
                else
                    buffer.append(text + "\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        String output = buffer.toString();
        return output;
    }

    public void sendCommand(String command) {
        try {
            writer.write(command + "\n");
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // this methods returns a score of the given position (positive = white advantage). it can accept fen position or
    // a list of moves (if the fen = false)
    public double evaluatePosition(String position, boolean fen){
        double score = 0;

        // obtaining Stockfish's position evaluation
        if (fen){
            sendCommand("position fen "+ position);
        } else {
            sendCommand("position startpos moves " + position);
        }
        sendCommand("eval");
        String engineOutput = getOutput(10);
        while (!engineOutput.contains("Final evaluation ")) {
            engineOutput = getOutput(10);

        }

        // obtaining the final evaluation score from the large evaluation report
        int scoreIndex = engineOutput.lastIndexOf("Final evaluation");
        if (scoreIndex != -1) {
            String scoreString = engineOutput.substring(scoreIndex + 17);
            String[] temp = scoreString.split(" ");

            for (String s : temp) {
                if (!s.equals("")) {
                    scoreString = s;
                    break;
                }
            }


            score = Double.parseDouble(scoreString);
            System.out.println("Score: " + score);
        } else {
            System.out.println("No score found...");
        }
        return score;
    }

    public
}
