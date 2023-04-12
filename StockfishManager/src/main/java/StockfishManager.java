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
    //static ProcessBuilder pb = new ProcessBuilder("C:\\chessProject\\stockfish_15.1_win_x64_avx2\\stockfish-windows-2022-x86-64-avx2.exe");
    static BufferedReader reader;
    static Process p;
    static OutputStream stdin;
    static InputStream stderr;
    static InputStream stdout;
    static BufferedWriter writer;
    public static void main(String[] args) {

        // connect to the Engine
        try {
            //String exe = "C:\\xampp2\\htdocs\\ChessMate\\StockfishManager\\src\\main\\resources\\stockfish-windows-2022-x86-64-avx2.exe";
            //String exe = StockfishManager.class.getResource("stockfish-windows-2022-x86-64-avx2.exe").getFile();
            //pb = new ProcessBuilder(exe);
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

        // do engine calls here:
        //printMatches();
        while (true){
            joinGames();
            playEngineMoves();
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println("The action queue is empty. Updating the queue...");
        }


    }

    public static void printMatches(){

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
    public static void playEngineMoves(){

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
    public static void joinGames(){
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

    private static String getRandomStartingMove() {
        Random random = new Random(System.currentTimeMillis());
        String[] moves = {"e2e4", "d2d4", "c2c4", "g2g3", "g1f3"};
        return moves[random.nextInt(5)];
    }

    public static String getBestMove(String fen, int waitTime) {
        sendCommand("position fen " + fen);
        sendCommand("go movetime " + waitTime);
        String output = getOutput(waitTime + 500);

        while (!output.contains("bestmove ")) {
            output = getOutput(200);
            System.out.println("Output read failed. Attempting again");
        }

        return output.split("bestmove ")[1].split(" ")[0];
    }

    public static String getOutput(int waitTime) {
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

    public static void sendCommand(String command) {
        try {
            writer.write(command + "\n");
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
