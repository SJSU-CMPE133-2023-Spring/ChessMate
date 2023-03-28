//kinda static variables for the model
const EMPTY = 0, ENEMY = 1, ALLY = 2;
const WHITE = 'white', BLACK = 'black';



// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;
let pieceSelected = null;

// Model Variables



let opponent = "id of an opponent / or AI id (if we have multiple: simple/medium/pro)";
let currentPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
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



    //update the board model:
    changePieceLocationOnBoard(oldX, oldY, newX, newY);
    hideLegalMoves();

    //part of waiting for opponent's move
    turn = !turn;

    console.log("Move completed: attempt to make an ajax call with gameID = %d, current position = %s, and last move = %s", gameID, currentPosition, lastMove);
    //ajaxCall(gameID, currentPosition, lastMove);
    ajaxCall(gameID, currentPosition, lastMove)
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
    squareSelected = null;
    pieceSelected = null;
}

function changePieceLocationOnBoard(oldX, oldY, newX, newY) {
    board[newY][newX] = board[oldY][oldX];
    board[oldY][oldX] = " ";
    updateBoardPosition();
    //console.log("ChangePieceLocationOnBoard: piece moved from " + oldX + ", " + oldY + " to " + newX + ", " + newY);
}

function displayOpponentMove(response){
    let oldX = parseInt(response.slice(0, 1), 36) - 10;
    let oldY = 8 - response.slice(1, 2);
    let newX = parseInt(response.slice(2, 3), 36) - 10;
    let newY = 8 - response.slice(3, 4);
    changePieceLocationOnBoard(oldX, oldY, newX, newY);

    document.getElementById(response.slice(2,4)).innerHTML = document.getElementById(response.slice(0,2)).innerHTML;

    //remove the piece from its current position
    document.getElementById(response.slice(0,2)).innerHTML = "";

}
function updateBoardPosition(){
    //TODO: add code that refreshes the currentPosition string based on the board position

}

function displayLegalMoves(legalMoves) {
    //console.log("displaying n = " + legalMoves.length + " moves...");
    for (let i = 0; i < legalMoves.length; i++) {
        addLegalMove(new Coordinate(legalMoves[i].x, legalMoves[i].y));
    }
}

/* TODO: make a method that will check if one of the legal moves allows opponent to capture the King
      * if there is such a move, it should be removed from the legal moves.
      * (this method can be only focused on the player from the bottom (ex. enemy pawns only move down))
      * Idea: the capture can be made only from specific positions: pawns can attack a king only from NW or NE,
           rooks only on the same x or y, and so on.
           one of the ways to do it is by creating a list of pieces that can attack the king if there is no one around,
           and then check if one of this attacks is blocked by a piece that is about to move. If after that move the king
           is in danger - the move should be removed from the legalMoves.
           LMAO
           too smart
           ima BRUTE FORCE instead


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
                    /* TODO: not switch column and row every damn time */
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
    if (playerColor==WHITE){
        switch (piece) {
            case "R":
                legalMoves = getRookMoves(x, y);
                break;
            case "B":
                legalMoves = getBishopMoves(x, y);
                break;
            case "N":
                legalMoves = getKnightMoves(x, y);
                break;
            case "Q":
                legalMoves = getQueenMoves(x, y);
                break;
            case "K":
                legalMoves = getKingMoves(x, y);
                break;
            case "P":
                legalMoves = getPawnMoves(x, y);
                break;
        }
    } else {
        switch (piece) {
            case "r":
                legalMoves = getRookMoves(x, y);
                break;
            case "b":
                legalMoves = getBishopMoves(x, y);
                break;
            case "n":
                legalMoves = getKnightMoves(x, y);
                break;
            case "q":
                legalMoves = getQueenMoves(x, y);
                break;
            case "k":
                legalMoves = getKingMoves(x, y);
                break;
            case "p":
                legalMoves = getPawnMoves(x, y);
                break;
        }
    }


    legalMoves = remSelfChecks(piece, x, y, legalMoves)

    console.log("GetLegalMoves: total number of moves =  " + legalMoves.length);

    return legalMoves;
}

function remSelfChecks(piece, x, y, moves) {
    let newMoves = [];
    //determine whose move it is
    let myColor = getPieceColor(piece);
    let opponent = BLACK;
    if (myColor === BLACK) opponent = WHITE;

    //check if moves has a move that gets their King checked
    for (let move of moves) {
        let originalBoard = board.map(innerArray => [...innerArray]);
        let checks = false;
//        board = originalBoard.map(innerArray => [...innerArray]);
        let checkBoard = board;
        checkBoard[y][x] = ' ';
        checkBoard[move.y][move.x] = piece;

        for (let checkY = 0; checkY < checkBoard.length; checkY++) {
            for (let checkX = 0; checkX < checkBoard.length; checkX++) {
                if (getPieceColor(checkBoard[checkY][checkX]) === opponent) {
                    let oppMoves = []
                    switch (checkBoard[checkY][checkX]) {
                        case "R": oppMoves = getRookMoves(checkX, checkY); break;
                        case "B": oppMoves = getBishopMoves(checkX, checkY); break;
                        case "N": oppMoves = getKnightMoves(checkX, checkY); break;
                        case "Q": oppMoves = getQueenMoves(checkX, checkY); break;
                        case "K": oppMoves = getKingMoves(checkX, checkY); break;
                        case "P": oppMoves = getPawnMoves(checkX, checkY); break;
                        case "r": oppMoves = getRookMoves(checkX, checkY); break;
                        case "b": oppMoves = getBishopMoves(checkX, checkY); break;
                        case "n": oppMoves = getKnightMoves(checkX, checkY); break;
                        case "q": oppMoves = getQueenMoves(checkX, checkY); break;
                        case "k": oppMoves = getKingMoves(checkX, checkY); break;
                        case "p": oppMoves = getPawnMoves(checkX, checkY); break;
                    }
                    for (let oppMove of oppMoves) {
                        if (checkBoard[oppMove.y][oppMove.x] == 'K' || checkBoard[oppMove.y][oppMove.x] == 'k') {
                            checks = true;
                        }
                    }
                }
            }
        }
        if (!checks) newMoves.push(move);
        board = originalBoard.map(innerArray => [...innerArray]);
    }
    return newMoves;
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

function getKingMoves(x, y) {
    let output = [];
    if (confirmSqr(x, y, x + 1, y + 1)===ENEMY ||confirmSqr(x, y, x + 1, y + 1)===EMPTY) output.push(new Coordinate(x + 1, y + 1));
    if (confirmSqr(x, y, x + 1, y)===ENEMY || confirmSqr(x, y, x + 1, y)=== EMPTY) output.push(new Coordinate(x + 1, y));
    if (confirmSqr(x, y, x + 1, y - 1)===ENEMY || confirmSqr(x, y, x + 1, y - 1)===EMPTY) output.push(new Coordinate(x + 1, y - 1));
    if (confirmSqr(x, y, x, y - 1) === ENEMY || confirmSqr(x, y, x, y - 1) === EMPTY) output.push(new Coordinate(x, y - 1));
    if (confirmSqr(x, y, x - 1, y - 1) === ENEMY || confirmSqr(x, y, x - 1, y - 1) === EMPTY) output.push(new Coordinate(x - 1, y - 1));
    if (confirmSqr(x, y, x - 1, y) === ENEMY || confirmSqr(x, y, x - 1, y) === EMPTY) output.push(new Coordinate(x - 1, y));
    if (confirmSqr(x, y, x - 1, y + 1) === ENEMY || confirmSqr(x, y, x - 1, y + 1) === EMPTY) output.push(new Coordinate(x - 1, y + 1));
    if (confirmSqr(x, y, x, y + 1) === ENEMY || confirmSqr(x, y, x, y + 1) === EMPTY) output.push(new Coordinate(x, y + 1));
    return output;
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

function getPawnMoves(x, y) {
    let output = [];
    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    let daColor = getPieceColor(board[y][x]);

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

// returns true if the given square(x1,y1) is one that can generally be moved onto, otherwise false
// (x0,y0) is location of the moving piece
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
    //console.log("AddLegalMove: attempting to add a move at parentID = "+coordinates.getSquareName());
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



class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getSquareName() {
        //let letterX = String.fromCharCode(this.x+97);
        //console.log("GetSquareName: squareName = "+ ""+String.fromCharCode(this.x+97)+(8-this.y));
        return "" + String.fromCharCode(this.x + 97) + (8 - this.y);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

}
