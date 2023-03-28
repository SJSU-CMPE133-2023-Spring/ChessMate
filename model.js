// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;
let pieceSelected = null;

// Model Variables
let currentPosition = "8/1Q5B/R7/8/r7/8/8/2K2r2";
let board = new Array(8);
//setBoard(currentPosition);
setBoard("8/1Q5B/R7/8/r7/8/8/2K2r2");
let gameID = 0;

// Controller Methods
function pieceClicked(element) {
    if ((squareSelected === null) || (element.parentElement.id !== squareSelected)) {
        hideLegalMoves();
        //element.parentElement.style.background="#ffd500";
        //cut the piece from the potential id (ex. P_6 -> P);
        let piece = element.id.slice(0, 1);
        //cut the letter from the coordinates and transform into a number (ex. "b4" -> 1)
        let x = parseInt(element.parentElement.id.slice(0, 1), 36) - 10;
        let y = 8 - element.parentElement.id.slice(1, 2);

        console.log("clickedPiece(piece = " + piece + ", x = " + x + "; y = " + y + ";");
        displayLegalMoves(getLegalMoves(piece, x, y));
        console.log("pieceClicked is finished!");
        squareSelected = element.parentElement.id;
        pieceSelected = element.id;
    } else {
        hideLegalMoves();
        squareSelected = null;
    }
}

function legalMoveClicked(element) {
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
    pieceSelected = null;
}

function changePieceLocationOnBoard(oldX, oldY, newX, newY) {
    board[newY][newX] = board[oldY][oldX];
    board[oldY][oldX] = " ";
    updateBoardPosition();
    console.log("ChangePieceLocationOnBoard: piece moved from " + oldX + ", " + oldY + " to " + newX + ", " + newY);
}

function updateBoardPosition(){

}
function displayLegalMoves(legalMoves) {
    console.log("displaying n = " + legalMoves.length + " moves...");
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

/* TODO: complete the getLegalMoves function:
    * add checkEast and West for the Rook
    * make similar methods for a Bishop and a Knight
    * getQueenMoves should simply have both getRookMoves and getBishopMoves
    * you can try to make King or Pawn, but keep in mind that King can step only on safe squares
       and pawn movement is pretty tricky (can be done partially)
   */
function getLegalMoves(pieceType, x, y) {
    let legalMoves = [];

    switch (pieceType) {

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
    console.log("GetLegalMoves: total number of moves =  " + legalMoves.length);
    return legalMoves;
}


function getRookMoves(x, y){
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
    if (confirmSqr(x, y, x+1, y+1)) output.push(new Coordinate(x+1, y+1));
    if (confirmSqr(x, y, x+1, y)) output.push(new Coordinate(x+1, y));
    if (confirmSqr(x, y, x+1, y-1)) output.push(new Coordinate(x+1, y-1));
    if (confirmSqr(x, y, x, y-1)) output.push(new Coordinate(x, y-1));
    if (confirmSqr(x, y, x-1, y-1)) output.push(new Coordinate(x-1, y-1));
    if (confirmSqr(x, y, x-1, y)) output.push(new Coordinate(x-1, y));
    if (confirmSqr(x, y, x-1, y+1)) output.push(new Coordinate(x-1, y+1));
    if (confirmSqr(x, y, x, y+1)) output.push(new Coordinate(x, y+1));
    return output;
}
function getKnightMoves(x, y) {
    let output = [];
    if (confirmSqr(x, y, x+1, y+2)) output.push(new Coordinate(x+1, y+2));
    if (confirmSqr(x, y, x+2, y+1)) output.push(new Coordinate(x+2, y+1));
    if (confirmSqr(x, y, x+1, y-2)) output.push(new Coordinate(x+1, y-2));
    if (confirmSqr(x, y, x+2, y-1)) output.push(new Coordinate(x+2, y-1));
    if (confirmSqr(x, y, x-1, y-2)) output.push(new Coordinate(x-1, y-2));
    if (confirmSqr(x, y, x-2, y-1)) output.push(new Coordinate(x-2, y-1));
    if (confirmSqr(x, y, x-1, y+2)) output.push(new Coordinate(x-1, y+2));
    if (confirmSqr(x, y, x-2, y+1)) output.push(new Coordinate(x-2, y+1));
    return output;
}
function getPawnMoves(x, y) {
    let output = [];
    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    daPiece = board[y][x];
    daColor = 'white';
    if (daPiece >= 'a' && daPiece <= 'z') {
        daColor = 'black';
    }
    //determine direction based on color
    if (daColor == 'white' && confirmSqr(x, y, x, y-1)) {
        output.push(new Coordinate(x, y-1));
        if (y == 6) output.push(new Coordinate(x, y-2));
    }
    if (daColor == 'black' && confirmSqr(x, y, x, y+1)) {
        output.push(new Coordinate(x, y+1));
        if (y == 1) output.push(new Coordinate(x, y+2));
    }
    return output;

}

function checkNorth(x, y){
  //console.log("Checking North... x = " + x + "; y = " + y);
  let output = [];
  let squaresTillEdge = y; //or just y
  while (squaresTillEdge > 0)// or > 0
  {
    squaresTillEdge--;
    valid = confirmSqr(x, y, x, squaresTillEdge);
    if (!valid) break;
    else output.push(new Coordinate(x, squaresTillEdge));
  }
  //console.log("North has " + output + " available positions. Size: " + output.length);
  return output;
}

function checkSouth(x, y){
  let output = [];
  let squaresTillEdge = y; //or just y
  while (squaresTillEdge < 7)// or > 0
  {
    squaresTillEdge++;
    valid = confirmSqr(x, y, x, squaresTillEdge);
    if (!valid) break;
    else output.push(new Coordinate(x, squaresTillEdge));
  }
  return output;
}

function checkEast(x, y) {
    let output = []
    let squaresTillEdge = x;
    while (squaresTillEdge < 7)
    {
        squaresTillEdge++;
        valid = confirmSqr(x, y, squaresTillEdge, y);
        if (!valid) break;
        else output.push(new Coordinate(squaresTillEdge, y));
    }
    return output;
}

function checkWest(x, y) {
    let output = []
    let squaresTillEdge = x;
    while (squaresTillEdge > 0)
    {
        squaresTillEdge--;
        valid = confirmSqr(x, y, squaresTillEdge, y);
        if (!valid) break;
        else output.push(new Coordinate(squaresTillEdge, y));
    }
    return output;
}

function checkNE(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge < 7 && yTillEdge > 0)
    {
        xTillEdge++;
        yTillEdge--;
        valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        if (!valid) break;
        else output.push(new Coordinate(xTillEdge, yTillEdge));
    }
    return output;
}

function checkSE(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge < 7 && yTillEdge < 7)
    {
        xTillEdge++;
        yTillEdge++;
        valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        if (!valid) break;
        else output.push(new Coordinate(xTillEdge, yTillEdge));

    }
    return output;
}

function checkSW(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge > 0 && yTillEdge < 7)
    {
        xTillEdge--;
        yTillEdge++;
        valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        if (!valid) break;
        else output.push(new Coordinate(xTillEdge, yTillEdge));
    }
    return output;
}

function checkNW(x, y) {
    let output = []
    let xTillEdge = x;
    let yTillEdge = y;
    while (xTillEdge > 0 && yTillEdge > 0)
    {
        xTillEdge--;
        yTillEdge--;
        valid = confirmSqr(x, y, xTillEdge, yTillEdge);
        if (!valid) break;
        else output.push(new Coordinate(xTillEdge, yTillEdge));
    }
    return output;
}

// returns true if the given square(x1,y1) is one that can generally be moved onto, otherwise false
// (x0,y0) is location of the moving piece
function confirmSqr(x0, y0, x1, y1) {
    //confirm if position is still on the board
    if (x1 < 0 || x1 > 7 || y1 < 0 || y1 > 7) return false;

    //to determine color of mover (i feel checking if its uppercase is more concise but risky and im too lazy)
    daPiece = board[y0][x0];
    daColor = 'white';
    if (daPiece >= 'a' && daPiece <= 'z') {
        daColor = 'black';
    }
    // determine color of piece in next space
    udaPiece = board[y1][x1];
    udaColor = 'white';
    if (udaPiece >= 'a' && udaPiece <= 'z') {
        udaColor = 'black';
    }

    //if empty spot - add
    if (udaPiece === " ") {
        //console.log("next square is empty! Adding it to the array");
        return true;
    }
    //if enemies
    else if (daColor == 'white' && udaColor == 'black' || daColor == 'black' && udaColor == 'white') {
        //console.log("enemy detected! Stop the count!");
        return false;
    } //if teammates
    else if (daColor == 'white' && udaColor == 'white' || daColor == 'black' && udaColor == 'black') {
        //console.log("ally detected at x="+x+", y="+squaresTillEdge+"! Stop the count!");
        return false;
    }
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

}
