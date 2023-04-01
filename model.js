// new Coordinate(3,5);  -  holds boardId: d3, only x and y stored as an int
// new Coordinate(undefined, undefined, d3);  -  holds x=3 and y=5
// i think, avoid passing more than those two arguments
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
            this.x = indices[0];
            this.y = indices[1];
        }

    }

    getSquareName() { return "" + String.fromCharCode(this.x + 97) + (8 - this.y); }

    getArrayId() { return "" + String.fromCharCode(this.rank - 97) + ","+ (8 + this.file); }

    toString() { return `(${this.rank}, ${this.file})`; }
}


//kinda static variables for the model
const EMPTY = 0, ENEMY = 1, ALLY = 2;
const WHITE = 'white', BLACK = 'black';

// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;
let pieceSelected = null;

// Model Variables
let gameID = document.getElementById("gameID").innerHTML;
let playerColor = document.getElementById("color").innerHTML;
let opponent = "id of an opponent / or AI id (if we have multiple: simple/medium/pro)";
//let currentPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
let currentPosition = "rnbqkbnr/pppqqppp/8/8/8/8/PPPQQPPP/RNBQKBNR w KQkq - 0 0";
let board = setBoard(currentPosition.split(' ')[0]);
logBoard(board);
// flip ids of the html board to blacks perspective if black
if (playerColor == BLACK) board = flipHTMLBoard(board);
fillHTMLBoard(board, playerColor);


//if white is first to move
let turn = (playerColor==WHITE);

//if black we have to wait for opponents move:
if (playerColor==BLACK){
    //wait for whites first move
    ajaxCall(gameID, currentPosition, "")
        .then(response => {
            console.log("received response: " + response);
            globalMoveUpdate(response);
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
        if (playerColor == getPieceColor(piece)) displayLegalMoves(getLegalMoves(piece, x, y));
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
    globalMoveUpdate(lastMove);

    //part of waiting for opponent's move
    console.log("Move completed: attempt to make an ajax call with gameID = %d, current position = %s, and last move = %s", gameID, currentPosition, lastMove);
    //ajaxCall(gameID, currentPosition, lastMove);
    ajaxCall(gameID, currentPosition, lastMove)
        .then(response => {
            console.log("received response: " + response);
            globalMoveUpdate(response);
        })
        .catch(error => {
            console.error(error);
            // handle the error
        });
    squareSelected = null;
    pieceSelected = null;
}

function globalMoveUpdate(move) {
    let oldX = parseInt(move.slice(0, 1), 36) - 10;
    let oldY = 8 - move.slice(1, 2);
    let newX = parseInt(move.slice(2, 3), 36) - 10;
    let newY = 8 - move.slice(3, 4);

    board = changePieceLocationOnBoard(board, oldX, oldY, newX, newY);
    fillHTMLBoard(board, playerColor);

    // TODO: display state of game on screen, maybe as a header - states include whose turn it is and mates
    const end = checkEndMates(board, getOppColor(playerColor));
    if (end) {
        console.log(end +' caused by ' + getOppColor(playerColor));
    }

    hideLegalMoves();
    turn = !turn;
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
            const nothingPersonalKid = new Coordinate(newX, oldY);
        }
        if (oldBoard[oldY][oldX] == 'p' && newX == fenX && newY == fenY) {
            board[newY-1][newX] = ' ';
            const nothingPersonalKid = new Coordinate(newX, oldY);
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
        }
        if (newX == kPos.x - 2) {
            const newCastlePos = new Coordinate(kPos.x-1, kPos.y);
            const oldCastlePos = new Coordinate(kPos.x-4, kPos.y);
            board[newCastlePos.y][newCastlePos.x] = board[oldCastlePos.y][oldCastlePos.x];
            board[oldCastlePos.y][oldCastlePos.x] = ' ';
        }
    }

    // promote a pawn to a queen TODO: user can choose to promote to other pieces
    if (oldBoard[oldY][oldX] == 'P' && newY == 0) {
        board[newY][newX] = 'Q';
    }
    if (oldBoard[oldY][oldX] == 'p' && newY == 7) {
        board[newY][newX] = 'q';
    }

    // finish up
    let newBoard = board.map(innerArray => [...innerArray]);
    if (affectGlobal) currentPosition = generateFen(oldBoard, newBoard, oldX, oldY, newX, newY);
    return board;
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

//when changing the id at the top left corner for example, I need to change the id of the bottom right at the same time, otherwise ids mix up/dupe or something
// thats why the for loops only cover half the board
function flipHTMLBoard(boardArr) {
    // flip rank and file indicator bars with themselves
    for(let i = 0; i < boardArr.length/2; i++) {
        const original = new Coordinate(i,i);
        const originalRank = 8 - original.square.charAt(1);
        const originalFile = original.square.charCodeAt(0) - 'a'.charCodeAt(0);

        const flippedRank = String.fromCharCode('1'.charCodeAt(0) + originalRank);
        const flippedFile = String.fromCharCode('h'.charCodeAt(0) - originalFile);

        // flip rank id
        let flipWithElement = document.getElementById(flippedRank);
        document.getElementById(original.rank).id = flippedRank;
        flipWithElement.id = original.rank;
        // flip rank html
        let flipWithInner = document.getElementById(flippedRank).innerHTML;
        document.getElementById(flippedRank).innerHTML = document.getElementById(original.rank).innerHTML;
        document.getElementById(original.rank).innerHTML = flipWithInner;
        // flip file id
        flipWithElement = document.getElementById(flippedFile);
        document.getElementById(original.file).id = flippedFile;
        flipWithElement.id = original.file;
        // flip file html
        flipWithInner = document.getElementById(flippedFile).innerHTML;
        document.getElementById(flippedFile).innerHTML = document.getElementById(original.file).innerHTML;
        document.getElementById(original.file).innerHTML = flipWithInner;
    }

    // swap the board ids of each square with the one across from it
    for (let rank = 0; rank < boardArr.length/2; rank++) {
        for (let file = 0; file < boardArr[0].length; file++) {
            const originalId = new Coordinate(file, rank).square;
            const originalRank = 8 - originalId.charAt(1);
            const originalFile = originalId.charCodeAt(0) - 'a'.charCodeAt(0);

            const flippedRank = String.fromCharCode('1'.charCodeAt(0) + originalRank);
            const flippedFile = String.fromCharCode('h'.charCodeAt(0) - originalFile);

            let flipWithElement = document.getElementById(flippedFile + flippedRank);
            document.getElementById(originalId).id = '' + flippedFile + flippedRank;
            flipWithElement.id = originalId;
        }
    }
    return boardArr;
}

// displays the board from the perspective of the color //black dont work yet i think
function fillHTMLBoard(boardArr, colorPerspective = WHITE) {
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

function getLegalMoves(piece, x, y) {
    let legalMoves = [];
    if (getPieceColor(piece) == WHITE) {
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
//    console.log("GetLegalMoves: total number of moves =  " + legalMoves.length);
    return legalMoves;
}

//removes moves that get own king checked, used for the raw unfiltered getLegalMoves or sumting
function remSelfChecks(piece, x, y, moves) {
    let newMoves = [];
    //determine whose move it is
    const myColor = getPieceColor(piece);
    const oppColor = getOppColor(myColor);

    //check if moves has a move that gets their King checked
    for (let move of moves) {
        let originalBoard = board.map(innerArray => [...innerArray]);
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
            if (getPieceColor(board[checkY][checkX]) === color) {
                let pieceMoves = [];
                if (color == WHITE) {
                    switch (board[checkY][checkX]) {
                        case "R": pieceMoves = getRookMoves(checkX, checkY); break;
                        case "B": pieceMoves = getBishopMoves(checkX, checkY); break;
                        case "N": pieceMoves = getKnightMoves(checkX, checkY); break;
                        case "Q": pieceMoves = getQueenMoves(checkX, checkY); break;
                        case "K": pieceMoves = getKingMoves(checkX, checkY, false); break;
                        case "P": pieceMoves = getPawnMoves(checkX, checkY, true); break;
                    }
                } else {
                    switch (board[checkY][checkX]) {
                        case "r": pieceMoves = getRookMoves(checkX, checkY); break;
                        case "b": pieceMoves = getBishopMoves(checkX, checkY); break;
                        case "n": pieceMoves = getKnightMoves(checkX, checkY); break;
                        case "q": pieceMoves = getQueenMoves(checkX, checkY); break;
                        case "k": pieceMoves = getKingMoves(checkX, checkY, false); break;
                        case "p": pieceMoves = getPawnMoves(checkX, checkY, true); break;
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
