import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;
import java.util.Random;

public class StockfishManager {
    // it will not create a connection
    static MysqlConnect mysqlConnect = new MysqlConnect();

    public static void main(String[] args) {
        //printMatches();
        joinGames();
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
}
