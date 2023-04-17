import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StockfishManagerTest {

    @Test
    public void testEvaluatePosition(){
        // this method should work with both fen and moves.
        StockfishManager manager = new StockfishManager();
        double expectedEvaluation = -5.90;
        String moves = "e2e4 d7d5 e4d5 d8d5 b1c3 d5d8 d2d3 e7e5 c1d2 b8c6 f1e2 g8e7 f2f3 e7f5 g1h3 f5h4 e1g1 c8h3 g2h3 d8d7 d2g5 d7h3 f1f2 f8c5 d3d4 c5d4 d1f1 h4f3 g1h1 h3f1 f2f1 f3g5 e2b5 h7h6 c3d5";
        String fen = "r3k2r/ppp2pp1/2n4p/1B1Np1n1/3b4/8/PPP4P/R4R1K b kq - 1 17";
        manager.evaluatePosition(moves, false);
        assertEquals(expectedEvaluation, manager.evaluatePosition(moves, false));
        assertEquals(expectedEvaluation, manager.evaluatePosition(fen, true));
    }

    @Test
    public void testGetLegalMoves(){
        String fen = "r3k2r/ppp2pp1/2n4p/1B1Np1n1/3b4/8/PPP4P/R4R1K b kq - 1 17";
        StockfishManager manager = new StockfishManager();
        manager.getLegalMoves(fen);
    }
}