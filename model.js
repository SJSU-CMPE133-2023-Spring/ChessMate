// new Coordinate(3,5);  -  holds boardId: d3, only x and y stored as an int
// new Coordinate(undefined, undefined, d3);  -  holds x=3 and y=5
// i think, avoid passing more than those two ways
class Coordinate {
    constructor(x, y, square = 'a0') {
        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
            this.square = this.getSquareName();
            this.rank = this.square.substring(1);
            this.file = this.square.charAt(0);
            
        }
        else { //square was given
            this.square = square;
            this.rank = this.square.substring(1);
            this.file = this.square.charAt(0);
            let indices = this.getArrayId().split(',');
            this.x = parseInt(indices[0]);
            this.y = parseInt(indices[1]);
        }
    }
    getSquareName() { return "" + String.fromCharCode(this.x + 97) + (8 - this.y); }

    getArrayId() { return "" + (this.file.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)) + "," + (8 - parseInt(this.rank)); }

    toString() { return `(${this.rank}, ${this.file})`; }

}

let rotationAngle = 0;

//kinda static variables for the model
const SUBSCRIPT_WIN = "win", SUBSCRIPT_CHECKMATE = "checkmate", SUBSCRIPT_DRAW = "draw";
const EMPTY = 0, ENEMY = 1, ALLY = 2;
const WHITE = 'white', BLACK = 'black';
//Board modes:
const BOARD_MODE_SANDBOX = 0, BOARD_MODE_ONLINE = 1;

// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;
let pieceSelected = null;
let promotion = '';
let boardMode;
let board;
let currentPosition;
let turn = true;
let playerColor;
let gameID;
let statusUpdateInterval;
let gameFinished = false;
let oldRating;

// IMPORTANT: if player is in an active game - when he enters this piece of code - it should set
// this board to player's current board, if player is not in an active game - this board should become
// a sandbox.

// TODO: check if a player is in an active gamee; Else:
boardMode = BOARD_MODE_SANDBOX;
document.addEventListener("DOMContentLoaded", function(){
    console.log("myID = "+document.getElementById("player-id").innerHTML);
});




// Model Variables
if (boardMode !== BOARD_MODE_SANDBOX){
    //this is actually different now and somehow you gotta get playerColor and gameID - another ajaxCall
    initOnlineGame();
}
if (boardMode === BOARD_MODE_SANDBOX){
    currentPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
    board = setBoard(currentPosition.split(' ')[0]);
    logBoard(board);
    fillHTMLBoard(board, WHITE);
}

function initOnlineGame(newGameID, newPlayerColor){
    console.log("Started new game: gameID = "+newGameID+"; playerColor = "+newPlayerColor);
    initializeTimers();
    gameID = newGameID;
    playerColor = newPlayerColor;
    turn = (playerColor===WHITE);
    loadPosition(gameID).then(response=>{
        currentPosition = response;
        board = setBoard(currentPosition.split(' ')[0]);
        logBoard(board);
        // flip ids of the html board to blacks perspective if black
        if (playerColor === BLACK) flipHTMLBoard(false);
        fillHTMLBoard(board, playerColor);

    });
    startGameStatusUpdates();
    if (playerColor===BLACK){
        //wait for whites first move
        writeToDB(gameID, currentPosition, "")
        .then(response => {
            console.log("received response: " + response);
            toggleTimers();
            oppFen = response.split('&')[0];
            oppMove = response.split('&')[1];
            globalMoveUpdate(oppMove);
            // for updating board if opp did a promotion, then globalMoveUpdate is not enough
            board = setBoard(oppFen.split(' ')[0]);
            fillHTMLBoard(board);
        })
        .catch(error => {
            console.error(error);
            // handle the error
        });
    }
}
// Controller Methods
function pieceClicked(element) {

    if (boardMode!==BOARD_MODE_SANDBOX && !turn) return; //uncomment this line to get turns
    if ((squareSelected == null) || (element.parentElement.id !== squareSelected)) {
        hideLegalMoves();
        if (boardMode!==BOARD_MODE_SANDBOX) document.getElementById(playerColor + ' promotion').style.display = 'none';

        //element.parentElement.style.background="#ffd500";
        //cut the piece from the potential id (ex. P_6 -> P);
        let piece = element.id.slice(0, 1);
        //cut the letter from the coordinates and transform into a number (ex. "b4" -> 1)
        let x = parseInt(element.parentElement.id.slice(0, 1), 36) - 10;
        let y = 8 - element.parentElement.id.slice(1, 2);

        //console.log("clickedPiece(piece = " + piece + ", x = " + x + "; y = " + y + ";");
        if (boardMode===BOARD_MODE_SANDBOX || playerColor == getPieceColor(piece)) displayLegalMoves(getLegalMoves(piece, x, y));
        //console.log("pieceClicked is finished!");
        squareSelected = element.parentElement.id;
        pieceSelected = element.id;
    } else {
        hideLegalMoves();
        if (boardMode!==BOARD_MODE_SANDBOX) document.getElementById(playerColor + ' promotion').style.display = 'none';
        squareSelected = null;
    }
}

function displayLegalMoves(legalMoves) {
    //console.log("displaying n = " + legalMoves.length + " moves...");
    for (let i = 0; i < legalMoves.length; i++) {
        addLegalMove(new Coordinate(legalMoves[i].x, legalMoves[i].y));
    }
}

async function legalMoveClicked(element) {
    // presents ui if promoting a pawn and stores it globally
    if (boardMode!==BOARD_MODE_SANDBOX) promotion = await promotePrompt(squareSelected, element.parentElement.id, playerColor);

    //save for the ajax call:
    let lastMove = squareSelected+element.parentElement.id;
    toggleTimers();
    globalMoveUpdate(lastMove);

    if (boardMode!==BOARD_MODE_SANDBOX){
        console.log("Move completed: attempt to make an ajax call with gameID = %d, current position = %s, and last move = %s", gameID, currentPosition, lastMove);

        //ajaxCall(gameID, currentPosition, lastMove);
        writeToDB(gameID, currentPosition, lastMove)
        .then(response => {
            console.log("received response: " + response);
            toggleTimers();
            oppFen = response.split('&')[0];
            oppMove = response.split('&')[1];
            globalMoveUpdate(oppMove);
            // for updating board if opp did a promotion, then globalMoveUpdate is not enough
            board = setBoard(oppFen.split(' ')[0]);
            fillHTMLBoard(board);

        })
        .catch(error => {
            console.error(error);
            // handle the error
        });
    }
    squareSelected = null;
    pieceSelected = null;
}

function globalMoveUpdate(move) {
    let oldX = parseInt(move.slice(0, 1), 36) - 10;
    let oldY = 8 - move.slice(1, 2);
    let newX = parseInt(move.slice(2, 3), 36) - 10;
    let newY = 8 - move.slice(3, 4);

    board = changePieceLocationOnBoard(board, oldX, oldY, newX, newY);
    fillHTMLBoard(board);
    highlightMove(oldX, oldY, newX, newY);

    // TODO: display state of game on screen, maybe as a header - states include whose turn it is and mates
    if (boardMode!==BOARD_MODE_SANDBOX){
        let end = checkEndMates(board, getOppColor(playerColor));
        if (end) {
            stopTimers();
            console.log(end +' caused by ' + getOppColor(playerColor));

            if (getOppColor(playerColor)===BLACK) {
                displaySuperscript(getPieceSquare("k"), SUBSCRIPT_WIN);
                displaySuperscript(getPieceSquare("K"), SUBSCRIPT_CHECKMATE);
            } else {
                displaySuperscript(getPieceSquare("K"), SUBSCRIPT_WIN);
                displaySuperscript(getPieceSquare("k"), SUBSCRIPT_CHECKMATE);
            }
            finishGame(0, "Lose by Checkmate" );
        }
        end = checkEndMates(board, playerColor);
        if (end) {
            stopTimers();
            console.log(end +' caused by ' + playerColor);


            finishGame(1, "Victory by Checkmate" );
        }
    }


    hideLegalMoves();
    turn = !turn;
}

// changes and returns a given board array given a moving piece, also handles promotion, castling, and en passant
// affectGlobal is false for when I need this method without changing the real board array and HTML
function changePieceLocationOnBoard(board, oldX, oldY, newX, newY, affectGlobal = true) {
    // logic for capture
    if (affectGlobal) capture(board[newY][newX]);


    // function start
    let oldBoard = board.map(innerArray => [...innerArray]);
    board[newY][newX] = board[oldY][oldX];
    board[oldY][oldX] = " ";

    // eat pawn if en passant was chosen
    const fenPassant = currentPosition.split(' ')[3];
    if (fenPassant != '-') {
        arrayId = new Coordinate(undefined, undefined, fenPassant);
        fenX = arrayId.x;
        fenY = arrayId.y;
        if (oldBoard[oldY][oldX] == 'P' && newX == fenX && newY == fenY) {
            board[newY+1][newX] = ' ';
            const nothingPersonalKid = new Coordinate(newX, oldY);
            if (affectGlobal) capture("p");
        }
        if (oldBoard[oldY][oldX] == 'p' && newX == fenX && newY == fenY) {
            board[newY-1][newX] = ' ';
            const nothingPersonalKid = new Coordinate(newX, oldY);
            if (affectGlobal) capture("P");
        }
    }

    // move rook if king made a castle move
    const color = getPieceColor(oldBoard[oldY][oldX]);
    const wKPos = new Coordinate(4, 7);
    const bKPos = new Coordinate(4, 0);
    let kPos = wKPos;
    if (color == BLACK) kPos = bKPos;

    if ((oldBoard[oldY][oldX] == 'K' || oldBoard[oldY][oldX] == 'k') && oldX == kPos.x && oldY == kPos.y) {
        if (newX == kPos.x + 2) {
            const newCastlePos = new Coordinate(kPos.x+1, kPos.y);
            const oldCastlePos = new Coordinate(kPos.x+3, kPos.y);
            board[newCastlePos.y][newCastlePos.x] = board[oldCastlePos.y][oldCastlePos.x];
            board[oldCastlePos.y][oldCastlePos.x] = ' ';
        }
        if (newX == kPos.x - 2) {
            const newCastlePos = new Coordinate(kPos.x-1, kPos.y);
            const oldCastlePos = new Coordinate(kPos.x-4, kPos.y);
            board[newCastlePos.y][newCastlePos.x] = board[oldCastlePos.y][oldCastlePos.x];
            board[oldCastlePos.y][oldCastlePos.x] = ' ';
        }
    }

    // promote a pawn to a queen TODO: user can choose to promote to other pieces
    if (boardMode===BOARD_MODE_SANDBOX){
        if (oldBoard[oldY][oldX] == 'P' && newY == 0) {
            board[newY][newX] = 'Q';
        }
        if (oldBoard[oldY][oldX] == 'p' && newY == 7) {
            board[newY][newX] = 'q';
        }
    } else {
        if (oldBoard[oldY][oldX] == 'P' && newY == 0) {
            board[newY][newX] = 'Q';
            if (affectGlobal && playerColor == WHITE) {
                board[newY][newX] = promotion;
                promotion = '';
            }
        }
        if (oldBoard[oldY][oldX] == 'p' && newY == 7) {
            board[newY][newX] = 'q';
            if (affectGlobal && playerColor == BLACK) {
                board[newY][newX] = promotion;
                promotion = '';
            }
        }
    }

    // finish up
    let newBoard = board.map(innerArray => [...innerArray]);
    if (affectGlobal) currentPosition = generateFen(oldBoard, newBoard, oldX, oldY, newX, newY);
    return board;
}



// will display pieces user can pick to promote pawn to and return the letter of that piece
function promotePrompt(srcId, destId, color) {
    const srcCoord = new Coordinate(undefined, undefined, srcId);
    const destCoord = new Coordinate(undefined, undefined, destId);

    if (board[srcCoord.y][srcCoord.x] == 'P' && destCoord.y == 0 || board[srcCoord.y][srcCoord.x] == 'p' && destCoord.y == 7) {
        const promoSqr = document.getElementById(destCoord.square + '_parent');
        const menu = document.getElementById(color + ' promotion');
        const images = menu.getElementsByTagName('img');
        promoSqr.appendChild(menu);
        menu.style.display = 'flex'; //make menu appear
        //to halt everything until user picks a piece to promote
        return new Promise((resolve, reject) => {
            for (let i = 0; i < images.length; i++) {
                images[i].addEventListener('click', () => {
                    menu.style = 'none'; //make menu disappear
                    // Resolve the promise with the selected piece
                    resolve(images[i].alt);
                });
            }
        });
    }
}

function hideLegalMoves() {
    let i, elements = document.getElementsByClassName('legal-move-space-img');
    for (i = elements.length; i--;) {
        elements[i].parentNode.removeChild(elements[i]);
    }
}

// Model methods
function setBoard(fenPosition) {
    //fenPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5"; aka the first part of a fen
    let position = fenPosition.split("/");
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
    return newBoard;
}

//the z difference is needed to prevent promotion ui from being overlapped/hidden
function flipHTMLBoard(animation){
    const board = document.getElementById('board');
    const squares = document.querySelectorAll('.square');
    rotationAngle += 180;
//    rotationAngle = (rotationAngle + 180) % 360; keeps rotation angle as either 0 or 180

    board.style.transform = `rotate(${rotationAngle}deg)`;
    if (animation) board.style.transition = 'transform 0.5s ease';
    let z = 100, delta = -1;
    if (rotationAngle % 360 == 0) delta = 1;
    squares.forEach(function (square) {
        square.style.transform = `rotate(${rotationAngle}deg)`;
        if (animation) square.style.transition = 'transform 0.5s ease';
        square.style.zIndex = z;
        z += delta;
    });
}

// populates the html given a board arr
function fillHTMLBoard(boardArr) {
    for (let rank = 0; rank < boardArr.length; rank++) {
        for (let file = 0; file < boardArr[0].length; file++) {
            const pieceId = board[rank][file];
            const color = getPieceColor(pieceId);
            let pieceName = '';
            switch (pieceId.toUpperCase()) {
                case "R": pieceName = 'rook'; break;
                case "B": pieceName = 'bishop'; break;
                case "N": pieceName = 'knight'; break;
                case "Q": pieceName = 'queen'; break;
                case "K": pieceName = 'king'; break;
                case "P": pieceName = 'pawn'; break;
            }

            let innerHTML = '';
            if (pieceName) innerHTML = `<img class="piece-img" onclick="pieceClicked(this)" id="${pieceId}" src="pieces/${color}-${pieceName}.png">`;

            const htmlCoord = new Coordinate(file, rank);
            document.getElementById(htmlCoord.square).innerHTML = innerHTML;
        }
    }
}

// removes any previous highlights and then highlights the two new squares that had activity
function highlightMove(oldX, oldY, newX, newY) {
    hideHighlightedMoves();

    const oldSqrId = new Coordinate(oldX, oldY).square;
    const newSqrId = new Coordinate(newX, newY).square;
    document.getElementById(oldSqrId).parentElement.classList.add('moved');
    document.getElementById(newSqrId).parentElement.classList.add('moved');
}
function hideHighlightedMoves(){
    const oldHighlights = document.querySelectorAll('div.moved');
    for (hl of oldHighlights) {
        hl.classList.remove('moved');
    }
}

function displaySuperscript(square, superscript){
    document.getElementById(square+"_superscript").innerHTML = `<img class="superscript-img" src="superscripts/${superscript}.png">`;
}

function hideSuperscripts(){
    const superscriptImages = document.querySelectorAll('.superscript-img');

    superscriptImages.forEach(img => {
        img.parentElement.removeChild(img);
    });
}

function getLegalMoves(piece, x, y) {
    let legalMoves = [];
    switch (piece.toUpperCase()) {
        case "R": legalMoves = getRookMoves(x, y); break;
        case "B": legalMoves = getBishopMoves(x, y); break;
        case "N": legalMoves = getKnightMoves(x, y); break;
        case "Q": legalMoves = getQueenMoves(x, y); break;
        case "K": legalMoves = getKingMoves(x, y); break;
        case "P": legalMoves = getPawnMoves(x, y); break;
    }
    legalMoves = remSelfChecks(piece, x, y, legalMoves);
    return legalMoves;
}

function getPieceSquare(target){
    let square = "";
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            if(board[checkY][checkX]===target) square = new Coordinate(checkX, checkY).square;
        }
    }
    return square;
}

//removes moves that get own king checked, used for the raw unfiltered getLegalMoves or sumting
function remSelfChecks(piece, x, y, moves) {
    let newMoves = [];
    //determine whose move it is
    const myColor = getPieceColor(piece);
    const oppColor = getOppColor(myColor);

    //check if moves has a move that gets their King checked
    for (let move of moves) {
        const originalBoard = board.map(innerArray => [...innerArray]);
        let selfCheck = false;
        board = changePieceLocationOnBoard(board, x, y, move.x, move.y, false);
        for (let oppMove of getColorAttacks(oppColor)) {
            if (board[oppMove.y][oppMove.x] == 'K' || board[oppMove.y][oppMove.x] == 'k') {
                selfCheck = true;
            }
        }

        if (!selfCheck) newMoves.push(move);
        board = originalBoard.map(innerArray => [...innerArray]);
    }
    return newMoves;
}

// returns if a given color has accomplished checkmate or stalemate, false otherwise
// movedColor = last color to make a move
function checkEndMates(board, movedColor) {
    const victimColor = getOppColor(movedColor);

    //look for any legal moves
    let availableMoves = [];
    let victimKing = undefined;
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            const piece = board[checkY][checkX];
            if (getPieceColor(piece) == victimColor) {
                for (let legalMove of getLegalMoves(piece, checkX, checkY)) {
                    availableMoves.push(legalMove);
                }
                if (piece == 'K' || piece == 'k') victimKing = new Coordinate(checkX, checkY);
            }
        }
    }
    if (availableMoves.length == 0) {
        inCheck = squareUnderFire(victimKing, movedColor);
        if (inCheck) return 'checkmate';
        else return 'stalemate';
    }
    // supposed victim can still make a move
    return ''; // Boolean('') evaluates false
}

//returns boolean whether a targetSqr (a coordinate) is covered by a given colors attack, needs to know the color that could attack that square
function squareUnderFire(targetSqr, color) {
    let underFire = false;
    for (let move of getColorAttacks(color)) {
        if (move.x == targetSqr.x && move.y == targetSqr.y) {
            underFire = true;
        }
    }
    return underFire;
}

// returns array of all attacks a color can make - INCLUDES ILLEGAL SELF CHECKS
function getColorAttacks(color) {
    let moves = [];
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            if (getPieceColor(board[checkY][checkX]) == color) {
                let pieceMoves = [];
                switch (board[checkY][checkX].toUpperCase()) {
                    case "R": pieceMoves = getRookMoves(checkX, checkY); break;
                    case "B": pieceMoves = getBishopMoves(checkX, checkY); break;
                    case "N": pieceMoves = getKnightMoves(checkX, checkY); break;
                    case "Q": pieceMoves = getQueenMoves(checkX, checkY); break;
                    case "K": pieceMoves = getKingMoves(checkX, checkY, false); break;
                    case "P": pieceMoves = getPawnMoves(checkX, checkY, true); break;
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
    const oppColor = getOppColor(color);

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

// sometimes need to only retrieve attacks because pawns cant check the square in front of them
function getPawnMoves(x, y, onlyAttacks = false) {
    let output = [];
    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    const daColor = getPieceColor(board[y][x]);
    const fenPassant = currentPosition.split(' ')[3];

    //determine direction based on color
    if (daColor === 'white') {
        if (confirmSqr(x, y, x, y - 1) === EMPTY && !onlyAttacks) {
            output.push(new Coordinate(x, y - 1));
            if (y == 6 && confirmSqr(x, y, x, y - 2) === EMPTY) output.push(new Coordinate(x, y - 2));
        }
        if (confirmSqr(x, y, x-1, y - 1) === ENEMY) {
            output.push(new Coordinate(x-1, y - 1));
        }
        if (confirmSqr(x, y, x+1, y - 1) === ENEMY) {
            output.push(new Coordinate(x+1, y - 1));
        }
        // en passant
        if (fenPassant != '-') {
            arrayId = new Coordinate(undefined, undefined, fenPassant);
            fenX = arrayId.x;
            fenY = arrayId.y;
            if (x == fenX - 1 && y == fenY + 1 && confirmSqr(x, y, fenX, y) === ENEMY) output.push(new Coordinate(fenX, fenY));
            if (x == fenX + 1 && y == fenY + 1 && confirmSqr(x, y, fenX, y) === ENEMY) output.push(new Coordinate(fenX, fenY));
        }
    }

    if (daColor === 'black') {
        if (confirmSqr(x, y, x, y + 1) === EMPTY) {
            output.push(new Coordinate(x, y + 1));
            if (y == 1 && confirmSqr(x, y, x, y + 2) === EMPTY) output.push(new Coordinate(x, y + 2));
        }
        if (confirmSqr(x, y, x-1, y + 1) === ENEMY) {
            output.push(new Coordinate(x-1, y + 1));
        }
        if (confirmSqr(x, y, x+1, y + 1) === ENEMY) {
            output.push(new Coordinate(x+1, y + 1));
        }
        // en passant
        if (fenPassant != '-') {
            arrayId = new Coordinate(undefined, undefined, fenPassant);
            fenX = arrayId.x;
            fenY = arrayId.y;
            if (x == fenX - 1 && y == fenY - 1 && confirmSqr(x, y, fenX, y) === ENEMY) output.push(new Coordinate(fenX, fenY));
            if (x == fenX + 1 && y == fenY - 1 && confirmSqr(x, y, fenX, y) === ENEMY) output.push(new Coordinate(fenX, fenY));
        }
    }
    return output;
}

function checkNorth(x, y) {
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

//capture logic
function capture(pieceLetter){
    let capturedByWhite, capturedByBlack

    if (playerColor === "white"){
        capturedByWhite = document.getElementById("player-captured").innerHTML;
        capturedByBlack = document.getElementById("opponent-captured").innerHTML;
    }
    if (playerColor === "black"){
        capturedByBlack = document.getElementById("player-captured").innerHTML;
        capturedByWhite = document.getElementById("opponent-captured").innerHTML;
    }

    switch (pieceLetter){
        case " ": return;
        case "p": capturedByWhite = capturedByWhite + "♟"; break;
        case "n": capturedByWhite = capturedByWhite + "♞"; break;
        case "b": capturedByWhite = capturedByWhite + "♝"; break;
        case "r": capturedByWhite = capturedByWhite + "♜"; break;
        case "q": capturedByWhite = capturedByWhite + "♛"; break;
        case "k": capturedByWhite = capturedByWhite + "♚"; break;
        case "P": capturedByBlack = capturedByBlack + "♙"; break;
        case "N": capturedByBlack = capturedByBlack + "♘"; break;
        case "B": capturedByBlack = capturedByBlack + "♗"; break;
        case "R": capturedByBlack = capturedByBlack + "♖"; break;
        case "Q": capturedByBlack = capturedByBlack + "♕"; break;
        case "K": capturedByBlack = capturedByBlack + "♔"; break;
    }

    if (playerColor === "white"){
        document.getElementById("player-captured").innerHTML = capturedByWhite;
        document.getElementById("opponent-captured").innerHTML = capturedByBlack;
    }
    if (playerColor === "black"){
        document.getElementById("player-captured").innerHTML = capturedByBlack;
        document.getElementById("opponent-captured").innerHTML = capturedByWhite;
    }
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
        return EMPTY;
    }
    //if enemies
    else if (daColor == 'white' && udaColor == 'black' || daColor == 'black' && udaColor == 'white') {
        return ENEMY;
    } //if teammates
    else if (daColor == 'white' && udaColor == 'white' || daColor == 'black' && udaColor == 'black') {
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
    if (pieceMoved == 'P' && oldY == 6 && newY == 4) newFen += ' ' + new Coordinate(newX, newY+1).square;
    else if (pieceMoved == 'p' && oldY == 1 && newY == 3) newFen += ' ' + new Coordinate(newX, newY-1).square;
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
        for (let file = 0; file < arr[0].length; file++) {
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

// returns the opposite of a color
function getOppColor(color) {
    let oppColor = WHITE;
    if (color == WHITE) oppColor = BLACK;
    return oppColor;
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

function logBoard(board) {
    console.log("Given board: ")
    for (let y = 0; y < 8; y++) {
        console.log(board[y]);
    }
}

// mySQL connection:
/*
Our goal is to send the changes of the model to the DB and get the response (that we are to display later)
 */
//this method makes a db call with the following arguments:
function writeToDB(gameID, position, lastMove){ //rename to something like notifyDB()
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
function loadPosition(gameID){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        //xhr.open("GET", "DBActions/test.php")
        xhr.open("GET", "DBActions/loadPosition.php?id=" + gameID);
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

//game start logic
function startClassicButtonOnClick(){
    startGameButtonOnClick("classic");
}
function startRankedButtonOnClick(){
    startGameButtonOnClick("ranked");
}
function startEngineButtonOnClick(){
    startGameButtonOnClick("engine");
}
async function startGameButtonOnClick(gameType) {
    // Switch container view
    switchContainerView("initial-menu", "waiting-game-menu");

    // Get player ID
    const playerId = document.getElementById('player-id').innerHTML;
    let storedGameId;

    // Make AJAX call to createOrEnterLobby.php
    try {
        const response = await fetch(`DBActions/createOrEnterLobby.php?id=${playerId}&type=${gameType}`);
        const result = await response.text();
        if (result === null) {
            console.log("Lobby is already created!!!");
            return;
        }

        const [newGameId, lobbyStatus, newPlayerColor] = result.split('&');
        console.log("Response from createOrEnterLobby:", result);

        // Declare a variable to store the timeout ID
        storedGameId = newGameId;
        let updateGameStatusTimeout;

        // Function to cancel the waiting process
        async function cancelWaiting() {
            // Stop the updateGameStatus loop
            clearTimeout(updateGameStatusTimeout);

            // Make AJAX call to delete the created waiting lobby
            try {
                await fetch(`DBActions/deleteLobby.php?id=${newGameId}`);
            } catch (error) {
                console.error('Error during cancelWaiting fetch:', error);
            }
            switchContainerView("waiting-game-menu","initial-menu");
        }

        // Attach cancelWaiting to the cancel button's onclick event
        document.getElementById('cancel-button').onclick = cancelWaiting;

        // Function to update the game status
        const updateGameStatus = (async function loop() {
            try {
                const response = await fetch(`DBActions/getLobbyStatus.php?playerId=${playerId}&gameId=${storedGameId}`);
                const status = await response.text();
                const [newGameId, lobbyStatus, newPlayerColor] = status.split('&');
                console.log("Response from getLobbyStatus:", status);
                console.log(lobbyStatus);
                if (lobbyStatus === 'ready') {
                    // Stop the updateGameStatus loop and start the game

                    clearTimeout(updateGameStatusTimeout);
                    startGame(newGameId, newPlayerColor);
                } else {
                    // Schedule the next updateGameStatus call
                    updateGameStatusTimeout = setTimeout(loop, 1000); // Adjust the delay as needed
                }
            } catch (error) {
                console.error('Error during updateGameStatus fetch:', error);
            }
        });

        if (lobbyStatus === 'waiting') {
            // Call updateGameStatus in a loop with a delay
            updateGameStatus();

        } else if (lobbyStatus === 'ready') {
            // Start the game if the lobby is found
            startGame(newGameId, newPlayerColor);
        }
    } catch (error) {
        console.error('Error during createOrEnterLobby fetch:', error);
    }
}


async function startGame(gameID, newPlayerColor) {
    playerColor = newPlayerColor;

    //make ajax call to get match data from DB
    const response = await fetch(`DBActions/getOnStartData.php?id=${gameID}`);
    const status = await response.text();
    const [whiteName, whiteRating, whiteIcon, blackName, blackRating, blackIcon] = status.split('&');
    console.log("Response from getOnStartData:", status);
    //setup fields name:
    if (newPlayerColor === "white") {
        document.getElementById("player-name").innerHTML = whiteName+" ("+whiteRating+")";
        document.getElementById("player-icon").innerHTML = `<img class="img-responsive" alt="white player profile" src="icons/${whiteIcon}">`;
        document.getElementById("player-captured").innerHTML = "";

        document.getElementById("opponent-icon").innerHTML = `<img class="img-responsive" alt="black player profile" src="icons/${blackIcon}">`;
        document.getElementById("opponent-name").innerHTML = blackName+" ("+blackRating+")";
        document.getElementById("opponent-captured").innerHTML = "";

        oldRating = whiteRating;
    }
    if (newPlayerColor === "black"){

        document.getElementById("opponent-name").innerHTML = whiteName+" ("+whiteRating+")";
        document.getElementById("opponent-icon").innerHTML = `<img class="img-responsive" alt="opponent profile" src="icons/${whiteIcon}">`;
        document.getElementById("opponent-captured").innerHTML = "";

        document.getElementById("player-icon").innerHTML = `<img class="img-responsive" alt="player profile" src="icons/${blackIcon}">`;
        document.getElementById("player-name").innerHTML = blackName+" ("+blackRating+")";
        document.getElementById("player-captured").innerHTML = "";
        oldRating = blackRating;
    }

    boardMode = BOARD_MODE_ONLINE;
    initOnlineGame(gameID, newPlayerColor);
    switchContainerView("waiting-game-menu", "online-game-menu");
    hideHighlightedMoves();

    console.log("start game!!!");

}
//Draw logic
async function offerDraw() {
    document.getElementById("offer-draw-button").classList.add("hidden");


    const response = await fetch(`DBActions/offerDraw.php?id=${gameID}&color=${playerColor}`);
    const status = await response.text();

    if (status === "draw") {
        finishGame(0.5, "Draw by agreement");
    }
}



//Timer logic
let timerWhite, timerBlack;
let whiteTime, blackTime;
let whiteInterval, blackInterval;
let whiteRunning = false;
let blackRunning = false;

function initializeTimers() {
    whiteTime = 1 * 60;
    blackTime = 1 * 60;
    updateTimers();
    toggleTimers();
}

function updateTimers() {
    if (playerColor ==="white"){
        document.getElementById('player-time').textContent = formatTime(whiteTime);
        document.getElementById('opponent-time').textContent = formatTime(blackTime);
    }
    if (playerColor ==="black"){
        document.getElementById('player-time').textContent = formatTime(blackTime);
        document.getElementById('opponent-time').textContent = formatTime(whiteTime);
    }
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimers() {
    if (whiteRunning) {
        clearInterval(whiteInterval);
        blackInterval = setInterval(decrementBlackTimer, 1000);
    } else {
        clearInterval(blackInterval);
        whiteInterval = setInterval(decrementWhiteTimer, 1000);
    }
    whiteRunning = !whiteRunning;
    blackRunning = !blackRunning;
}

function stopTimers(){
    clearInterval(whiteInterval);
    clearInterval(blackInterval);
    whiteRunning = false;
    blackRunning = false;

}

function decrementWhiteTimer() {
    whiteTime--;
    updateTimers();
    if (whiteTime === 0) {
        clearInterval(whiteInterval);
        console.log('White player ran out of time.');
    }
}

function decrementBlackTimer() {
    blackTime--;
    updateTimers();
    if (blackTime === 0) {
        clearInterval(blackInterval);
        console.log('Black player ran out of time.');
    }
}

function startGameStatusUpdates() {
    gameFinished = false;
    const checkStatusLoop = async function loop() {
        const response = await fetch(`DBActions/getGameStatus.php?id=${gameID}`);
        const status = await response.text();
        console.log("status = "+status);
        if (status === "draw") {
            finishGame(0.5, "Draw");
        }
        if (status === "white won") {
            if (playerColor === "white") finishGame(1, "The Victory is yours!");
            if (playerColor === "black") finishGame(0, "You lost!");
        }
        if (status === "black won") {
            if (playerColor === "black") finishGame(1, "The Victory is yours!");
            if (playerColor === "white") finishGame(0, "You lost!");
        }
        if ((status === "draw offer from white" && playerColor === "black") ||
        (status === "draw offer from black" && playerColor === "white")){
            document.getElementById("offer-draw-button").innerText = "Accept Draw";
            document.getElementById("draw-offer-message").classList.remove('hidden');
        }
        if ((status === "black resigned" && playerColor ==="white")||
        (status === "white resigned" && playerColor === "black"))
        {
            finishGame(1, "Opponent resigned!");
        }
    };

    statusUpdateInterval = setInterval(checkStatusLoop, 500);
}
async function finishGame(result, message){
    if (gameFinished) return;

    if ((result == 1 && playerColor=="white")||(result == 0 && playerColor=="black")) {
        displaySuperscript(getPieceSquare("K"), SUBSCRIPT_WIN);
        displaySuperscript(getPieceSquare("k"), SUBSCRIPT_CHECKMATE);
    }
    if ((result == 1 && playerColor=="black")||(result == 0 && playerColor=="white")){
        displaySuperscript(getPieceSquare("k"), SUBSCRIPT_WIN);
        displaySuperscript(getPieceSquare("K"), SUBSCRIPT_CHECKMATE);
    }
    if (result == 0.5){
        displaySuperscript(getPieceSquare("k"), SUBSCRIPT_DRAW);
        displaySuperscript(getPieceSquare("K"), SUBSCRIPT_DRAW);
    }





    gameFinished = true;
    const response = await fetch(`DBActions/getRatingChange.php?id=${gameID}&color=${playerColor}&result=${result}`);
    const ratingChange = await response.text();
    if (ratingChange!==0) console.log("rating change = " + ratingChange);

    document.getElementById("draw-offer-message").classList.add('hidden');
    turn = false;
    clearInterval(statusUpdateInterval);
    stopTimers();
    document.getElementById("offer-draw-button").classList.add("hidden");
    document.getElementById("quit-button").innerText = "Back to Main Menu";


    console.log("Game finished: "+message);
    let ratingChanges = "";
    if (ratingChange!=0) ratingChanges = "Rating change: "+oldRating+" > "+(parseInt(oldRating)+parseInt(ratingChange))
    document.getElementById("rating-changes-text").innerText = ratingChanges;
    showDialog(message);

}

// resign or quit game
function quitGameOnclick(){
    if (gameFinished) {
        if (document.getElementById("opponent-name").innerText==="Stockfish Engine (???)"){
            switchContainerView("engine-game-menu", "initial-menu");
        } else {
            switchContainerView("online-game-menu", "initial-menu");
        }
        setGameStatus("finished");
        initMainMenu();

    } else {
        setGameStatus(playerColor+" resigned")
        finishGame(0, "You resigned");
    }
}

function initMainMenu(){

    boardMode = BOARD_MODE_SANDBOX;
    currentPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
    board = setBoard(currentPosition.split(' ')[0]);
    logBoard(board);
    fillHTMLBoard(board, WHITE);
    turn = true;
    if (playerColor ==="black") flipHTMLBoard(true);
    hideSuperscripts();
    console.log("hiding");
    hideHighlightedMoves();
    document.getElementById("player-captured").innerHTML = "";
    document.getElementById("opponent-captured").innerHTML = "";
    document.getElementById("offer-draw-button").classList.remove("hidden");
    document.getElementById("offer-draw-button").innerText = "Offer Draw";
    document.getElementById("quit-button").innerText = "Resign";

    document.getElementById("player-name").innerHTML = "";
    document.getElementById("opponent-name").innerHTML = "";
    document.getElementById("player-icon").innerHTML = "";
    document.getElementById("opponent-icon").innerHTML = "";
    document.getElementById("opponent-time").innerHTML = "";
    document.getElementById("player-time").innerHTML = "";

}

function setGameStatus(status){
    const response = fetch(`DBActions/setGameStatus.php?id=${gameID}&status=${status}`);
}


