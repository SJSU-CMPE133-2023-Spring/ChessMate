//kinda static variables for the model
const EMPTY = 0, ENEMY = 1, ALLY = 2;
const WHITE = 'white', BLACK = 'black';



// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;
let pieceSelected = null;

// Model Variables



let opponent = "id of an opponent / or AI id (if we have multiple: simple/medium/pro)";
let currentPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
let board = new Array(8);
//setBoard(currentPosition);
setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");

let gameID = document.getElementById("gameID").innerHTML;
let playerColor = document.getElementById("color").innerHTML;

//if white is first to move
let turn = (playerColor==WHITE);

//if black we have to wait for opponents move:
if (playerColor==BLACK){
    ajaxCall(gameID, currentPosition, "")
        .then(response => {
            console.log("received response: " + response);
            // TODO: handle the DB response here
            displayOpponentMove(response);
            turn = !turn;
        })
        .catch(error => {
            console.error(error);
            // handle the error
        });
}

// Controller Methods
function pieceClicked(element) {
    if (!turn) return; //uncomment this line to get turns
    if ((squareSelected === null) || (element.parentElement.id !== squareSelected)) {
        hideLegalMoves();
        //element.parentElement.style.background="#ffd500";
        //cut the piece from the potential id (ex. P_6 -> P);
        let piece = element.id.slice(0, 1);
        //cut the letter from the coordinates and transform into a number (ex. "b4" -> 1)
        let x = parseInt(element.parentElement.id.slice(0, 1), 36) - 10;
        let y = 8 - element.parentElement.id.slice(1, 2);

        //console.log("clickedPiece(piece = " + piece + ", x = " + x + "; y = " + y + ";");
        displayLegalMoves(getLegalMoves(piece, x, y));
        //console.log("pieceClicked is finished!");
        squareSelected = element.parentElement.id;
        pieceSelected = element.id;
    } else {
        hideLegalMoves();
        squareSelected = null;
    }
}

function displayLegalMoves(legalMoves) {
    //console.log("displaying n = " + legalMoves.length + " moves...");
    for (let i = 0; i < legalMoves.length; i++) {
        addLegalMove(new Coordinate(legalMoves[i].x, legalMoves[i].y));
    }
}

function legalMoveClicked(element) {
    //save for the ajax call:
    let lastMove = squareSelected+element.parentElement.id;

    let oldX = parseInt(squareSelected.slice(0, 1), 36) - 10;
    let oldY = 8 - squareSelected.slice(1, 2);
    let newX = parseInt(element.parentElement.id.slice(0, 1), 36) - 10;
    let newY = 8 - element.parentElement.id.slice(1, 2)

    //move the current piece to a new place
    document.getElementById(element.parentElement.id).innerHTML = document.getElementById(squareSelected).innerHTML;
    //remove the piece from its current position
    document.getElementById(squareSelected).innerHTML = "";

    //update the board model, comes after updating html for some reason
    board = changePieceLocationOnBoard(board, oldX, oldY, newX, newY);

    //part of waiting for opponent's move
    hideLegalMoves();
    turn = !turn;
    // TODO: CHECK FOR MATE OR STALEMATE

    console.log("Move completed: attempt to make an ajax call with gameID = %d, current position = %s, and last move = %s", gameID, currentPosition, lastMove);
    //ajaxCall(gameID, currentPosition, lastMove);
    ajaxCall(gameID, currentPosition, lastMove)
        .then(response => {
            console.log("received response: " + response);
            // TODO: handle the DB response here
            displayOpponentMove(response);
            // TODO: CHECK FOR MATE OR STALEMATE
            turn = !turn;
        })
        .catch(error => {
            console.error(error);
            // handle the error
        });
    squareSelected = null;
    pieceSelected = null;
}

function displayOpponentMove(response) {
    let oldX = parseInt(response.slice(0, 1), 36) - 10;
    let oldY = 8 - response.slice(1, 2);
    let newX = parseInt(response.slice(2, 3), 36) - 10;
    let newY = 8 - response.slice(3, 4);
    board = changePieceLocationOnBoard(board, oldX, oldY, newX, newY);
    document.getElementById(response.slice(2,4)).innerHTML = document.getElementById(response.slice(0,2)).innerHTML;
    //remove the piece from its current position
    document.getElementById(response.slice(0,2)).innerHTML = "";
}

//changes and returns a given board array given a moving piece, also handles promotion, castling, and en passant
// affectGlobal is false for when I need this method without changing the real board array and HTML
function changePieceLocationOnBoard(board, oldX, oldY, newX, newY, affectGlobal = true) {
    let oldBoard = board.map(innerArray => [...innerArray]);
    board[newY][newX] = board[oldY][oldX];
    board[oldY][oldX] = " ";

    // eat pawn if en passant was chosen
    const fenPassant = currentPosition.split(' ')[3];
    if (fenPassant != '-') {
        fenX = parseInt(fenPassant.split(',')[0]);
        fenY = parseInt(fenPassant.split(',')[1]);
        if (oldBoard[oldY][oldX] == 'P' && newX == fenX && newY == fenY) {
            board[newY+1][newX] = ' ';
            //update html
            const nothingPersonalKid = new Coordinate(newX, oldY);
            if (affectGlobal) document.getElementById(nothingPersonalKid.getSquareName()).innerHTML = '';
        }
        if (oldBoard[oldY][oldX] == 'p' && newX == fenX && newY == fenY) {
            board[newY-1][newX] = ' ';
            const nothingPersonalKid = new Coordinate(newX, oldY);
            if (affectGlobal) document.getElementById(nothingPersonalKid.getSquareName()).innerHTML = '';
        }
    }

    // move rook if king made a castle move
    const color = getPieceColor(oldBoard[oldY][oldX]);
    const wKPos = new Coordinate(4, 7);
    const bKPos = new Coordinate(4, 0);
    let kPos = wKPos;
    if (color == BLACK) kPos = bKPos;

    if (oldBoard[oldY][oldX] == 'K' || oldBoard[oldY][oldX] == 'k' && oldX == kPos.x && oldY == kPos.y) {
        if (newX == kPos.x + 2) {
            const newCastlePos = new Coordinate(kPos.x+1, kPos.y);
            const oldCastlePos = new Coordinate(kPos.x+3, kPos.y);
            board[newCastlePos.y][newCastlePos.x] = board[oldCastlePos.y][oldCastlePos.x];
            board[oldCastlePos.y][oldCastlePos.x] = ' ';
            //change HTML
            if (affectGlobal) {
                document.getElementById(newCastlePos.getSquareName()).innerHTML = document.getElementById(oldCastlePos.getSquareName()).innerHTML;
                document.getElementById(oldCastlePos.getSquareName()).innerHTML = '';
            }
        }
        if (newX == kPos.x - 2) {
            const newCastlePos = new Coordinate(kPos.x-1, kPos.y);
            const oldCastlePos = new Coordinate(kPos.x-4, kPos.y);
            board[newCastlePos.y][newCastlePos.x] = board[oldCastlePos.y][oldCastlePos.x];
            board[oldCastlePos.y][oldCastlePos.x] = ' ';
            //change HTML
            if (affectGlobal) {
                document.getElementById(newCastlePos.getSquareName()).innerHTML = document.getElementById(oldCastlePos.getSquareName()).innerHTML;
                document.getElementById(oldCastlePos.getSquareName()).innerHTML = '';
            }
        }
    }

    // finish up
    let newBoard = board.map(innerArray => [...innerArray]);
    if (affectGlobal) currentPosition = generateFen(oldBoard, newBoard, oldX, oldY, newX, newY);
    return board;
}


/* TODO: make a method that will check if one of the legal moves allows opponent to capture the King
      * if there is such a move, it should be removed from the legal moves.
      * (this method can be only focused on the player from the bottom (ex. enemy pawns only move down))
      * Idea: the capture can be made only from specific positions: pawns can attack a king only from NW or NE,
           rooks only on the same x or y, and so on.
           one of the ways to do it is by creating a list of pieces that can attack the king if there is no one around,
           and then check if one of this attacks is blocked by a piece that is about to move. If after that move the king
           is in danger - the move should be removed from the legalMoves.
 */

function hideLegalMoves() {
    let i, elements = document.getElementsByClassName('legal-move-space-img');
    for (i = elements.length; i--;) {
        elements[i].parentNode.removeChild(elements[i]);
    }
}

// Model methods
function setBoard(newPosition) {
    //newPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5";
    let position = newPosition.split("/");
    let newBoard = new Array(8);
    for (let column = 0; column < 8; column++) {
        newBoard[column] = new Array(8);
        let line = position[column];
        for (let row = 0; row < 8; row++) {

            for (let charRead = 0; charRead < line.length; charRead++) {
                let nextChar = line.slice(charRead, charRead + 1);
                if (!(nextChar >= '0' && nextChar <= '9')) {
                    newBoard[column][row] = nextChar;
                    row++;
                } else {
                    for (let i = 0; i < nextChar; i++) {
                        newBoard[column][row] = " ";
                        row++;
                    }
                }
            }
        }
    }
    board = newBoard;
    logBoard();
}

function getLegalMoves(piece, x, y) {
    let legalMoves = [];
    if (playerColor == WHITE) {
        switch (piece) {
            case "R": legalMoves = getRookMoves(x, y); break;
            case "B": legalMoves = getBishopMoves(x, y); break;
            case "N": legalMoves = getKnightMoves(x, y); break;
            case "Q": legalMoves = getQueenMoves(x, y); break;
            case "K": legalMoves = getKingMoves(x, y); break;
            case "P": legalMoves = getPawnMoves(x, y); break;
        }
    } else {
        switch (piece) {
            case "r": legalMoves = getRookMoves(x, y); break;
            case "b": legalMoves = getBishopMoves(x, y); break;
            case "n": legalMoves = getKnightMoves(x, y); break;
            case "q": legalMoves = getQueenMoves(x, y); break;
            case "k": legalMoves = getKingMoves(x, y); break;
            case "p": legalMoves = getPawnMoves(x, y); break;
        }
    }
    legalMoves = remSelfChecks(piece, x, y, legalMoves)
    console.log("GetLegalMoves: total number of moves =  " + legalMoves.length);
    return legalMoves;
}

function remSelfChecks(piece, x, y, moves) {
    let newMoves = [];
    //determine whose move it is
    const myColor = getPieceColor(piece);
    let opponent = BLACK;
    if (myColor === BLACK) opponent = WHITE;

    //check if moves has a move that gets their King checked
    for (let move of moves) {
        let originalBoard = board.map(innerArray => [...innerArray]);
        let selfCheck = false;
        board = changePieceLocationOnBoard(board, x, y, move.x, move.y, false);

        for (let oppMove of getColorMoves(opponent)) {
            if (board[oppMove.y][oppMove.x] == 'K' || board[oppMove.y][oppMove.x] == 'k') {
                selfCheck = true;
            }
        }

        if (!selfCheck) newMoves.push(move);
        board = originalBoard.map(innerArray => [...innerArray]);
    }
    return newMoves;
}

//returns boolean whether a targetSqr (a coordinate) is covered by a given colors attack, needs to know the color that could attack that square
function squareUnderFire(targetSqr, color) {
    let underFire = false;
    for (let move of getColorMoves(color)) {
        if (move.x == targetSqr.x && move.y == targetSqr.y) {
            underFire = true;
        }
    }
    return underFire;
}

// returns array of all moves a color can make - INCLUDES SELF CHECKS
function getColorMoves(color) {
    let moves = [];
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            if (getPieceColor(board[checkY][checkX]) === color) {
                let pieceMoves = [];
                if (color == WHITE) {
                    switch (board[checkY][checkX]) {
                        case "R": pieceMoves = getRookMoves(checkX, checkY); break;
                        case "B": pieceMoves = getBishopMoves(checkX, checkY); break;
                        case "N": pieceMoves = getKnightMoves(checkX, checkY); break;
                        case "Q": pieceMoves = getQueenMoves(checkX, checkY); break;
                        case "K": pieceMoves = getKingMoves(checkX, checkY, false); break;
                        case "P": pieceMoves = getPawnMoves(checkX, checkY); break;
                    }
                } else {
                    switch (board[checkY][checkX]) {
                        case "r": pieceMoves = getRookMoves(checkX, checkY); break;
                        case "b": pieceMoves = getBishopMoves(checkX, checkY); break;
                        case "n": pieceMoves = getKnightMoves(checkX, checkY); break;
                        case "q": pieceMoves = getQueenMoves(checkX, checkY); break;
                        case "k": pieceMoves = getKingMoves(checkX, checkY, false); break;
                        case "p": pieceMoves = getPawnMoves(checkX, checkY); break;
                    }
                }
                for (let move of pieceMoves) {
                    moves.push(move);
                }
            }
        }
    }
    return moves;
}


function getRookMoves(x, y) {
    return [...checkNorth(x, y), ...checkEast(x, y), ...checkSouth(x, y), ...checkWest(x, y)];
}

function getBishopMoves(x, y) {
    return [...checkNE(x, y), ...checkSE(x, y), ...checkSW(x, y), ...checkNW(x, y)];
}

function getQueenMoves(x, y) {
    return [...getRookMoves(x, y), ...getBishopMoves(x, y)];
}

function getKnightMoves(x, y) {
    let output = [];
    if (confirmSqr(x, y, x + 1, y + 2)===ENEMY ||confirmSqr(x, y, x + 1, y + 2)===EMPTY) output.push(new Coordinate(x + 1, y + 2));
    if (confirmSqr(x, y, x + 2, y + 1)===ENEMY ||confirmSqr(x, y, x + 2, y + 1)===EMPTY) output.push(new Coordinate(x + 2, y + 1));
    if (confirmSqr(x, y, x + 1, y - 2)===ENEMY ||confirmSqr(x, y, x + 1, y - 2)===EMPTY) output.push(new Coordinate(x + 1, y - 2));
    if (confirmSqr(x, y, x + 2, y - 1)===ENEMY ||confirmSqr(x, y, x + 2, y - 1)===EMPTY) output.push(new Coordinate(x + 2, y - 1));
    if (confirmSqr(x, y, x - 1, y - 2)===ENEMY ||confirmSqr(x, y, x - 1, y - 2)===EMPTY) output.push(new Coordinate(x - 1, y - 2));
    if (confirmSqr(x, y, x - 2, y - 1)===ENEMY ||confirmSqr(x, y, x - 2, y - 1)===EMPTY) output.push(new Coordinate(x - 2, y - 1));
    if (confirmSqr(x, y, x - 1, y + 2)===ENEMY ||confirmSqr(x, y, x - 1, y + 2)===EMPTY) output.push(new Coordinate(x - 1, y + 2));
    if (confirmSqr(x, y, x - 2, y + 1)===ENEMY ||confirmSqr(x, y, x - 2, y + 1)===EMPTY) output.push(new Coordinate(x - 2, y + 1));
    return output;
}

function getKingMoves(x, y, getCastleMoves = true) {
    let output = [];
    if (confirmSqr(x, y, x + 1, y + 1)===ENEMY ||confirmSqr(x, y, x + 1, y + 1)===EMPTY) output.push(new Coordinate(x + 1, y + 1));
    if (confirmSqr(x, y, x + 1, y)===ENEMY || confirmSqr(x, y, x + 1, y)=== EMPTY) output.push(new Coordinate(x + 1, y));
    if (confirmSqr(x, y, x + 1, y - 1)===ENEMY || confirmSqr(x, y, x + 1, y - 1)===EMPTY) output.push(new Coordinate(x + 1, y - 1));
    if (confirmSqr(x, y, x, y - 1) === ENEMY || confirmSqr(x, y, x, y - 1) === EMPTY) output.push(new Coordinate(x, y - 1));
    if (confirmSqr(x, y, x - 1, y - 1) === ENEMY || confirmSqr(x, y, x - 1, y - 1) === EMPTY) output.push(new Coordinate(x - 1, y - 1));
    if (confirmSqr(x, y, x - 1, y) === ENEMY || confirmSqr(x, y, x - 1, y) === EMPTY) output.push(new Coordinate(x - 1, y));
    if (confirmSqr(x, y, x - 1, y + 1) === ENEMY || confirmSqr(x, y, x - 1, y + 1) === EMPTY) output.push(new Coordinate(x - 1, y + 1));
    if (confirmSqr(x, y, x, y + 1) === ENEMY || confirmSqr(x, y, x, y + 1) === EMPTY) output.push(new Coordinate(x, y + 1));

    // get castle moves if the rules allow it
    const color = getPieceColor(board[y][x]);
    let oppColor = WHITE;
    if (color == WHITE) oppColor = BLACK;

    const fenCastle = currentPosition.split(' ')[2];
    if (fenCastle != '-' && getCastleMoves) {
        // castling availability, one may or may not be null
        const whiteCastle = fenCastle.match(/[A-Z]/g);
        const blackCastle = fenCastle.match(/[a-z]/g);
        let castleSides = whiteCastle;
        if (color == BLACK) castleSides = blackCastle;

        const wKPos = new Coordinate(4, 7);
        const bKPos = new Coordinate(4, 0);
        let kPos = wKPos;
        if (color == BLACK) kPos = bKPos;

        // confirm castle availability, and if in check
        if (castleSides != null && !squareUnderFire(kPos, oppColor)) {
            for (let side of castleSides) {
                if (side == 'K' || side == 'k') {
                    // confirm spaces between are empty, the two spaces king covers are not attacked
                    let allClear = true;
                    if (confirmSqr(kPos.x, kPos.y, kPos.x + 1, kPos.y) != EMPTY) allClear = false;
                    if (confirmSqr(kPos.x, kPos.y, kPos.x + 2, kPos.y) != EMPTY) allClear = false;
                    if (squareUnderFire(new Coordinate(kPos.x + 1, kPos.y), oppColor)) allClear = false;
                    if (squareUnderFire(new Coordinate(kPos.x + 2, kPos.y), oppColor)) allClear = false;
                    if (allClear) output.push(new Coordinate(kPos.x + 2, kPos.y));
                }
                if (side == 'Q' || side == 'q') {
                    let allClear = true;
                    if (confirmSqr(kPos.x, kPos.y, kPos.x - 1, kPos.y) != EMPTY) allClear = false;
                    if (confirmSqr(kPos.x, kPos.y, kPos.x - 2, kPos.y) != EMPTY) allClear = false;
                    if (confirmSqr(kPos.x, kPos.y, kPos.x - 3, kPos.y) != EMPTY) allClear = false;
                    if (squareUnderFire(new Coordinate(kPos.x - 1, kPos.y), oppColor)) allClear = false;
                    if (squareUnderFire(new Coordinate(kPos.x - 2, kPos.y), oppColor)) allClear = false;
                    if (allClear) output.push(new Coordinate(kPos.x - 2, kPos.y));
                }
            }
        }
    }
    return output;
}

function getPawnMoves(x, y) {
    let output = [];
    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    const daColor = getPieceColor(board[y][x]);
    const fenPassant = currentPosition.split(' ')[3];

    //determine direction based on color
    if (daColor === 'white') {
        if (confirmSqr(x, y, x, y - 1) === EMPTY) {
            output.push(new Coordinate(x, y - 1));
            if (y == 6 && confirmSqr(x, y, x, y - 2) === EMPTY) output.push(new Coordinate(x, y - 2));
        }
        if (confirmSqr(x, y, x-1, y - 1) === ENEMY) {
            output.push(new Coordinate(x-1, y - 1));
            //Here is the place for en passant - if (something)
            // when
        }
        if (confirmSqr(x, y, x+1, y - 1) === ENEMY) {
            output.push(new Coordinate(x+1, y - 1));
            //Here is the place for en passant - if (something)
        }
        // en passant
        if (fenPassant != '-') {
            fenX = parseInt(fenPassant.split(',')[0]);
            fenY = parseInt(fenPassant.split(',')[1]);
            if (x == fenX - 1 && y == fenY + 1) output.push(new Coordinate(fenX, fenY));
            if (x == fenX + 1 && y == fenY + 1) output.push(new Coordinate(fenX, fenY));
        }
    }

    if (daColor === 'black') {
        if (confirmSqr(x, y, x, y + 1) === EMPTY) {
            output.push(new Coordinate(x, y + 1));
            if (y == 1 && confirmSqr(x, y, x, y + 2) === EMPTY) output.push(new Coordinate(x, y + 2));
        }
        if (confirmSqr(x, y, x-1, y + 1) === ENEMY) {
            output.push(new Coordinate(x-1, y + 1));
            //Here is the place for en passant - if (something)
        }
        if (confirmSqr(x, y, x+1, y + 1) === ENEMY) {
            output.push(new Coordinate(x+1, y + 1));
            //Here is the place for en passant - if (something)
        }
        // en passant
        if (fenPassant != '-') {
            fenX = parseInt(fenPassant.split(',')[0]);
            fenY = parseInt(fenPassant.split(',')[1]);
            if (x == fenX - 1 && y == fenY - 1) output.push(new Coordinate(fenX, fenY));
            if (x == fenX + 1 && y == fenY - 1) output.push(new Coordinate(fenX, fenY));
        }
    }
    return output;
}

function checkNorth(x, y) {
    //console.log("Checking North... x = " + x + "; y = " + y);
    let output = [];
    let squaresTillEdge = y; //or just y
    while (squaresTillEdge > 0)// or > 0
    {
        squaresTillEdge--;
        let valid = confirmSqr(x, y, x, squaresTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(x, squaresTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(x, squaresTillEdge));
                return output;
            case ALLY:
                return output;
        }
    }
    //console.log("North has " + output + " available positions. Size: " + output.length);
    return output;
}

function checkSouth(x, y) {
    let output = [];
    let squaresTillEdge = y; //or just y
    while (squaresTillEdge < 7)// or > 0
    {
        squaresTillEdge++;
        let valid = confirmSqr(x, y, x, squaresTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(x, squaresTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(x, squaresTillEdge));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

function checkEast(x, y) {
    let output = []
    let squaresTillEdge = x;
    while (squaresTillEdge < 7) {
        squaresTillEdge++;
        let valid = confirmSqr(x, y, squaresTillEdge, y);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(squaresTillEdge, y));
                break;
            case ENEMY:
                output.push(new Coordinate(squaresTillEdge, y));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

function checkWest(x, y) {
    let output = []
    let squaresTillEdge = x;
    while (squaresTillEdge > 0) {
        squaresTillEdge--;
        let valid = confirmSqr(x, y, squaresTillEdge, y);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(squaresTillEdge, y));
                break;
            case ENEMY:
                output.push(new Coordinate(squaresTillEdge, y));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

function checkNE(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge < 7 && yTillEdge > 0) {
        xTillEdge++;
        yTillEdge--;
        let valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

function checkSE(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge < 7 && yTillEdge < 7) {
        xTillEdge++;
        yTillEdge++;
        let valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                return output;
            case ALLY:
                return output;
        }

    }
    return output;
}

function checkSW(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge > 0 && yTillEdge < 7) {
        xTillEdge--;
        yTillEdge++;
        let valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

function checkNW(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge > 0 && yTillEdge > 0) {
        xTillEdge--;
        yTillEdge--;
        let valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        switch (valid) {
            case EMPTY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                break;
            case ENEMY:
                output.push(new Coordinate(xTillEdge, yTillEdge));
                return output;
            case ALLY:
                return output;
        }
    }
    return output;
}

// returns occupation of the given square(x1,y1) given a starting position, false if not a valid square
// (x0,y0) is location of the moving piece
// excludes self checks and special rules idk
function confirmSqr(x0, y0, x1, y1) {
    //confirm if position is still on the board
    if (x1 < 0 || x1 > 7 || y1 < 0 || y1 > 7) return false;

    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    let daPiece = board[y0][x0];
    let daColor = getPieceColor(daPiece);
    // determine color of piece in next space
    let udaPiece = board[y1][x1];
    let udaColor = getPieceColor(udaPiece)

    //if empty spot - add
    if (udaPiece === " ") {
        //console.log("next square is empty! Adding it to the array");
        return EMPTY;
    }
    //if enemies
    else if (daColor == 'white' && udaColor == 'black' || daColor == 'black' && udaColor == 'white') {
        //console.log("enemy detected! Stop the count!");
        return ENEMY;
    } //if teammates
    else if (daColor == 'white' && udaColor == 'white' || daColor == 'black' && udaColor == 'black') {
        //console.log("ally detected at x="+x+", y="+squaresTillEdge+"! Stop the count!");
        return ALLY;
    }
}

// returns a fen given the changes from the old board to the new board array
// NOTE: enpassant part is stored as 'x,y' ranging from 0-7, otherwise '-'
function generateFen(oldBoard, newBoard, oldX, oldY, newX, newY){
    // https://gbud.in/blog/game/chess/chess-fen-forsyth-edwards-notation.html#halfmove-clock
    // constants are old values
    const fenArr = currentPosition.split(" ");
    const color = fenArr[1]
    const castle = fenArr[2]
    const passant = fenArr[3]
    const halfClk = fenArr[4]
    const movNum = fenArr[5]
    const pieceMoved = oldBoard[oldY][oldX];

    //begin new fen
    let newFen = genFenPieces(newBoard);
    // active color
    if (color == 'w') newFen += ' b ';
    else newFen += ' w ';

    // castle (does color matter or previous fen for castle?
    let whiteCastle = castle.match(/[A-Z]/g);
    let blackCastle = castle.match(/[a-z]/g);
    let newCastle = '';
    if (castle == '-') newCastle += '-';
    else if (color == 'w') {
        if (pieceMoved == 'K') newCastle += '';
        else if (pieceMoved == 'R' && oldX == 0 && oldY == 7 && whiteCastle != null) newCastle += whiteCastle.filter(letter => letter !== 'Q').join('');
        else if (pieceMoved == 'R' && oldX == 7 && oldY == 7 && whiteCastle != null) newCastle += whiteCastle.filter(letter => letter !== 'K').join('');
        else if (whiteCastle != null) newCastle += whiteCastle.join('');
        if (blackCastle != null) newCastle += blackCastle.join('');
    }
    else if (color == 'b') {
        if (whiteCastle != null) newCastle += whiteCastle.join('');
        if (pieceMoved == 'k') newCastle += '';
        else if (pieceMoved == 'r' && oldX == 0 && oldY == 0 && blackCastle != null) newCastle += blackCastle.filter(letter => letter !== 'q').join('');
        else if (pieceMoved == 'r' && oldX == 7 && oldY == 0 && blackCastle != null) newCastle += blackCastle.filter(letter => letter !== 'k').join('');
        else if (blackCastle != null) newCastle += blackCastle.join('');
    }
    if (newCastle == '') newCastle = '-';
    newFen += newCastle;

    // en passant
    if (pieceMoved == 'P' && oldY == 6 && newY == 4) newFen += ' ' + newX + ',' + (newY+1);
    else if (pieceMoved == 'p' && oldY == 1 && newY == 3) newFen += ' ' + newX + ',' + (newY-1);
    else newFen += ' -';

    // half move clock
    if (pieceMoved == 'P' || pieceMoved == 'p' || oldBoard[newY][newX] != ' ') newFen += ' 0';
    else newFen += ' ' + (parseInt(halfClk) + 1);

    // full move number
    if (color == 'b') newFen += ' ' + (parseInt(movNum) + 1);
    else newFen += ' ' + movNum;

    return newFen;
}

// creates the first part of the fen string given a board array
function genFenPieces(arr) {
    let boardFen = '';
    for (let rank = 0; rank < arr.length; rank++) {
        countEmpty = 0;
        for (let file = 0; file < arr.length; file++) {
            piece = arr[rank][file];
            if (piece != ' ') {
                if (countEmpty != 0) {
                    boardFen += countEmpty;
                    countEmpty = 0;
                }
                boardFen += piece;
            } else {
                countEmpty++;
            }
        }
        if (countEmpty != 0) {
            boardFen += countEmpty;
            countEmpty = 0;
        }
        if (rank < arr.length - 1) boardFen += '/';
    }
    return boardFen;
}

//given a string (ex: 'r', 'P', 'q', or 'B') returns 'white' or 'black'
function getPieceColor(pieceType) {
    if (pieceType == ' ') {
        color = EMPTY;
    }
    if (pieceType >= 'A' && pieceType <= 'Z') {
        color = WHITE;
    }
    if (pieceType >= 'a' && pieceType <= 'z') {
        color = BLACK;
    }
    return color;
}

function addLegalMove(coordinates) {
    let img = document.createElement("img");
    img.src = "green_circle.png";
    img.className = "legal-move-space-img";
    img.setAttribute("onclick", "legalMoveClicked(this)");

    let src = document.getElementById(coordinates.getSquareName());
//    console.log("AddLegalMove: attempting to add a move at parentID = "+coordinates.getSquareName());
    src.appendChild(img);
}

function logBoard() {
    console.log("Current board position is:")
    for (let y = 0; y < 8; y++) {
        console.log(board[y]);
    }
}
function logBoard2(board) {
    console.log("Current board position is:")
    for (let y = 0; y < 8; y++) {
        console.log(board[y]);
    }
}

// mySQL connection:
/*
Our goal is to send the changes of the model to the DB and get the response (that we are to display later)
 */
//this method makes a db call with the following arguments:
function ajaxCall(gameID, position, lastMove){ //rename to something like notifyDB()
    //console.log("entered ajax call");
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        //xhr.open("GET", "DBActions/test.php")
        xhr.open("GET", "DBActions/makeMove.php?id=" + gameID + "&position=" + position + "&lastMove=" + lastMove);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function () {
            reject("Network Error");
        };
        xhr.send();
    });

}

// new Coordinate(3,5);  -  holds boardId: d3, only x and y stored as an int
// new Coordinate(undefined, undefined, d3);  -  holds x=3 and y=5
//i think, avoid passing more than those two arguments
class Coordinate {
    constructor(x, y, square = 'a0') {
        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
            this.square = this.getSquareName();
            this.rank = square.charAt(0);
            this.file = square.substring(1);
        }
        else { //square was given
            this.square = square;
            this.rank = square.charAt(0);
            this.file = square.substring(1);
            let indices = this.getArrayId().split(',');
            this.x = indices[0];
            this.y = indices[1];
        }
    }

    getSquareName() {
        //let letterX = String.fromCharCode(this.x+97);
        //console.log("GetSquareName: squareName = "+ ""+String.fromCharCode(this.x+97)+(8-this.y));
        return "" + String.fromCharCode(this.x + 97) + (8 - this.y);
    }

    getArrayId() {
        return "" + String.fromCharCode(this.rank - 97) + ","+ (8 + this.file);
    }

    toString() {
        return `(${this.rank}, ${this.file})`;
    }

}