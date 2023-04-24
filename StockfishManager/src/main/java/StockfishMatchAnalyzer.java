public class StockfishMatchAnalyzer {
    public final String INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
    public String[][] analyzeMatch(StockfishManager manager, String[] moves) {
        String[][] analysis = new String[moves.length][3];
        String analyzed = ""; // this string will contain moves that are processed.
        String fen = INITIAL_POSITION;
        manager.evaluatePosition("", false); //make sure Stockfish is set to starting position

        for (int i = 0; i < moves.length; i++) {
            if (i == 0) analyzed = analyzed.concat(moves[i]);
            else analyzed = analyzed.concat(" "+moves[i]);
            fen = manager.getLastFenPosition();
            analysis[i][0] = fen;
            analysis[i][1] = moves[i];
            analysis[i][2] = manager.evaluatePosition(analyzed, false);
        }

        return analysis;
    }
}
