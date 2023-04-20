/*
import {board, changePieceLocationOnBoard, playerColor, currentPosition, updateBoard} from "./model.js";

const EMPTY = 0, ENEMY = 1, ALLY = 2;
const WHITE = 'white', BLACK = 'black';

export class Coordinate {
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


export function getRookMoves(x, y) {
    return [...checkNorth(x, y), ...checkEast(x, y), ...checkSouth(x, y), ...checkWest(x, y)];
}

export function getBishopMoves(x, y) {
    return [...checkNE(x, y), ...checkSE(x, y), ...checkSW(x, y), ...checkNW(x, y)];
}

export function getQueenMoves(x, y) {
    return [...getRookMoves(x, y), ...getBishopMoves(x, y)];
}

export function getKnightMoves(x, y) {
    let output = [];
    if (confirmSqr(x, y, x + 1, y + 2) === ENEMY || confirmSqr(x, y, x + 1, y + 2) === EMPTY) output.push(new Coordinate(x + 1, y + 2));
    if (confirmSqr(x, y, x + 2, y + 1) === ENEMY || confirmSqr(x, y, x + 2, y + 1) === EMPTY) output.push(new Coordinate(x + 2, y + 1));
    if (confirmSqr(x, y, x + 1, y - 2) === ENEMY || confirmSqr(x, y, x + 1, y - 2) === EMPTY) output.push(new Coordinate(x + 1, y - 2));
    if (confirmSqr(x, y, x + 2, y - 1) === ENEMY || confirmSqr(x, y, x + 2, y - 1) === EMPTY) output.push(new Coordinate(x + 2, y - 1));
    if (confirmSqr(x, y, x - 1, y - 2) === ENEMY || confirmSqr(x, y, x - 1, y - 2) === EMPTY) output.push(new Coordinate(x - 1, y - 2));
    if (confirmSqr(x, y, x - 2, y - 1) === ENEMY || confirmSqr(x, y, x - 2, y - 1) === EMPTY) output.push(new Coordinate(x - 2, y - 1));
    if (confirmSqr(x, y, x - 1, y + 2) === ENEMY || confirmSqr(x, y, x - 1, y + 2) === EMPTY) output.push(new Coordinate(x - 1, y + 2));
    if (confirmSqr(x, y, x - 2, y + 1) === ENEMY || confirmSqr(x, y, x - 2, y + 1) === EMPTY) output.push(new Coordinate(x - 2, y + 1));
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
    else if (daColor === 'white' && udaColor === 'black' || daColor === 'black' && udaColor === 'white') {
        return ENEMY;
    } //if teammates
    else if (daColor === 'white' && udaColor === 'white' || daColor === 'black' && udaColor === 'black') {
        return ALLY;
    }
}

export function getLegalMoves(piece, x, y) {
    let legalMoves = [];
    if (getPieceColor(piece) === WHITE) {
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
        updateBoard(changePieceLocationOnBoard(board, currentPosition, x, y, move.x, move.y, false));

        for (let oppMove of getColorAttacks(oppColor)) {
            if (board[oppMove.y][oppMove.x] === 'K' || board[oppMove.y][oppMove.x] === 'k') {
                selfCheck = true;
            }
        }

        if (!selfCheck) newMoves.push(move);
        updateBoard(originalBoard.map(innerArray => [...innerArray]));
    }
    return newMoves;
}

export function checkEndMates(board, movedColor) {
    const victimColor = getOppColor(movedColor);

    //look for any legal moves
    let availableMoves = [];
    let victimKing = undefined;
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            const piece = board[checkY][checkX];
            if (getPieceColor(piece) === victimColor) {
                for (let legalMove of getLegalMoves(piece, checkX, checkY)) {
                    availableMoves.push(legalMove);
                }
                if (piece === 'K' || piece === 'k') victimKing = new Coordinate(checkX, checkY);
            }
        }
    }
    if (availableMoves.length === 0) {
        let inCheck = squareUnderFire(victimKing, movedColor);
        if (inCheck) return 'checkmate';
        else return 'stalemate';
    }
    // supposed victim can still make a move
    return ''; // Boolean('') evaluates false
}

// returns array of all attacks a color can make - INCLUDES ILLEGAL SELF CHECKS
function getColorAttacks(color) {
    let moves = [];
    for (let checkY = 0; checkY < board.length; checkY++) {
        for (let checkX = 0; checkX < board.length; checkX++) {
            if (getPieceColor(board[checkY][checkX]) === color) {
                let pieceMoves = [];
                if (color === WHITE) {
                    switch (board[checkY][checkX]) {
                        case "R":
                            pieceMoves = getRookMoves(checkX, checkY);
                            break;
                        case "B":
                            pieceMoves = getBishopMoves(checkX, checkY);
                            break;
                        case "N":
                                pieceMoves = getKnightMoves(checkX, checkY);
                                break;
                        case "Q":
                            pieceMoves = getQueenMoves(checkX, checkY);
                            break;
                        case "K":
                            pieceMoves = getKingMoves(checkX, checkY, false);
                            break;
                        case "P":
                            pieceMoves = getPawnMoves(checkX, checkY, true);
                            break;
                    }
                } else {
                    switch (board[checkY][checkX]) {
                        case "r":
                            pieceMoves = getRookMoves(checkX, checkY);
                            break;
                        case "b":
                            pieceMoves = getBishopMoves(checkX, checkY);
                            break;
                        case "n":
                            pieceMoves = getKnightMoves(checkX, checkY);
                            break;
                        case "q":
                            pieceMoves = getQueenMoves(checkX, checkY);
                            break;
                        case "k":
                            pieceMoves = getKingMoves(checkX, checkY, false);
                            break;
                        case "p":
                            pieceMoves = getPawnMoves(checkX, checkY, true);
                            break;
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

function getKingMoves(x, y, getCastleMoves = true) {
    let output = [];
    if (confirmSqr(x, y, x + 1, y + 1) === ENEMY || confirmSqr(x, y, x + 1, y + 1) === EMPTY) output.push(new Coordinate(x + 1, y + 1));
    if (confirmSqr(x, y, x + 1, y) === ENEMY || confirmSqr(x, y, x + 1, y) === EMPTY) output.push(new Coordinate(x + 1, y));
    if (confirmSqr(x, y, x + 1, y - 1) === ENEMY || confirmSqr(x, y, x + 1, y - 1) === EMPTY) output.push(new Coordinate(x + 1, y - 1));
    if (confirmSqr(x, y, x, y - 1) === ENEMY || confirmSqr(x, y, x, y - 1) === EMPTY) output.push(new Coordinate(x, y - 1));
    if (confirmSqr(x, y, x - 1, y - 1) === ENEMY || confirmSqr(x, y, x - 1, y - 1) === EMPTY) output.push(new Coordinate(x - 1, y - 1));
    if (confirmSqr(x, y, x - 1, y) === ENEMY || confirmSqr(x, y, x - 1, y) === EMPTY) output.push(new Coordinate(x - 1, y));
    if (confirmSqr(x, y, x - 1, y + 1) === ENEMY || confirmSqr(x, y, x - 1, y + 1) === EMPTY) output.push(new Coordinate(x - 1, y + 1));
    if (confirmSqr(x, y, x, y + 1) === ENEMY || confirmSqr(x, y, x, y + 1) === EMPTY) output.push(new Coordinate(x, y + 1));

    // get castle moves if the rules allow it
    const color = getPieceColor(board[y][x]);
    const oppColor = getOppColor(color);

    const fenCastle = currentPosition.split(' ')[2];
    if (fenCastle !== '-' && getCastleMoves) {
        // castling availability, one may or may not be null
        const whiteCastle = fenCastle.match(/[A-Z]/g);
        const blackCastle = fenCastle.match(/[a-z]/g);
        let castleSides = whiteCastle;
        if (color === BLACK) castleSides = blackCastle;

        const wKPos = new Coordinate(4, 7);
        const bKPos = new Coordinate(4, 0);
        let kPos = wKPos;
        if (color === BLACK) kPos = bKPos;

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
                if (side === 'Q' || side === 'q') {
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
    //to determine color of mover
    const daColor = getPieceColor(board[y][x]);
    const fenPassant = currentPosition.split(' ')[3];

    //determine direction based on color
    if (daColor === 'white') {
        if (confirmSqr(x, y, x, y - 1) === EMPTY && !onlyAttacks) {
            output.push(new Coordinate(x, y - 1));
            if (y === 6 && confirmSqr(x, y, x, y - 2) === EMPTY) output.push(new Coordinate(x, y - 2));
        }
        if (confirmSqr(x, y, x - 1, y - 1) === ENEMY) {
            output.push(new Coordinate(x - 1, y - 1));
        }
        if (confirmSqr(x, y, x + 1, y - 1) === ENEMY) {
            output.push(new Coordinate(x + 1, y - 1));
        }
        // en passant
        if (fenPassant !== '-') {
            let arrayId = new Coordinate(undefined, undefined, fenPassant);
            let fenX = arrayId.x;
            let fenY = arrayId.y;
            if (x === fenX - 1 && y === fenY + 1) output.push(new Coordinate(fenX, fenY));
            if (x === fenX + 1 && y === fenY + 1) output.push(new Coordinate(fenX, fenY));
        }
    }

    if (daColor === 'black') {
        if (confirmSqr(x, y, x, y + 1) === EMPTY) {
            output.push(new Coordinate(x, y + 1));
            if (y === 1 && confirmSqr(x, y, x, y + 2) === EMPTY) output.push(new Coordinate(x, y + 2));
        }
        if (confirmSqr(x, y, x - 1, y + 1) === ENEMY) {
            output.push(new Coordinate(x - 1, y + 1));
        }
        if (confirmSqr(x, y, x + 1, y + 1) === ENEMY) {
            output.push(new Coordinate(x + 1, y + 1));
        }
        // en passant
        if (fenPassant !== '-') {
            let arrayId = new Coordinate(undefined, undefined, fenPassant);
            let fenX = arrayId.x;
            let fenY = arrayId.y;
            if (x === fenX - 1 && y === fenY - 1) output.push(new Coordinate(fenX, fenY));
            if (x === fenX + 1 && y === fenY - 1) output.push(new Coordinate(fenX, fenY));
        }
    }
    return output;
}

export function getPieceColor(pieceType) {
    let color;
    if (pieceType === ' ') {
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
export function getOppColor(color) {
    let oppColor = WHITE;
    if (color === WHITE) oppColor = BLACK;
    return oppColor;
}

//returns boolean whether a targetSqr (a coordinate) is covered by a given colors attack, needs to know the color that could attack that square
function squareUnderFire(targetSqr, color) {
    let underFire = false;
    for (let move of getColorAttacks(color)) {
        if (move.x === targetSqr.x && move.y === targetSqr.y) {
            underFire = true;
        }
    }
    return underFire;
}
*/