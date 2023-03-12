// Controller Variables
let pieceSelected = false; //if true, then clicking on a highlighted square = move;


// Model Variables
var currentPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5";
var board = new Array(8);
//setBoard(currentPosition);
setBoard("R7/PP4PP/8/8/R5R1/8/8/RPR5");
var gameID = 0;
// Controller Methods
function pieceClicked(element){
  if(!pieceSelected){
    element.parentElement.style.background="#00FF00";
    //cut the piece from the potential id (ex. P_6 -> P);
    let piece = element.id.slice(0,1);
    //cut the letter from the coordinates and transform into a number (ex. "b4" -> 2)
    let x = parseInt(element.parentElement.id.slice(0,1), 36) - 9;
    let y = element.parentElement.id.slice(1,2);

    console.log("clickedPiece(piece = "+ piece+", x = "+x+"; y = "+y+";");
    getLegalMoves(piece, x, y);
    addPiece(element, new Coordinate(6, 6));
    console.log("piece added");
  }
}


// Model methods
function setBoard(newPosition){
  //newPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5";
  let position = newPosition.split("/");
  let newBoard = new Array(8);
  for (let column = 0; column < 8; column++){
    newBoard[column] = new Array(8);
    let line = position[column];
    for (let row = 0; row < 8;row++){

      for (let charRead = 0; charRead<line.length; charRead++) {
          let nextChar = line.slice(charRead, charRead+1);
          if (!(nextChar >= '0' && nextChar <= '9')) {
              newBoard[column][row] = nextChar;
              row++;
          }  else {
          for (var i = 0; i < nextChar; i++) {
            newBoard[column][row] = " ";
            row++;
          }
        }
      }
    }
  }
  this.board = newBoard;
  console.log("New board is set: ")
  console.log(board);
}
// TODO: this method blocks the code, while it's unfinished
function getLegalMoves(pieceType, x, y) {
  console.log("here!");
  let legalMoves = [];

  switch (pieceType) {
    case "R": //for Rook
        legalMoves.concat(getRookMoves(x, y));
        break;
    case "P":
      console.log("Pawn");

  }
  console.log("Total legal moves are: " + legalMoves);
}

function getRookMoves(x, y){
  return [].concat(checkNorth(x, y));
  //return [].concat(checkNorth(x, y),checkEast(x, y), checkSouth(x, y), checkWest(x, y));
}

function checkNorth(x, y){
  console.log("Checking North... x = " + x + "; y = " + y);
  let output = [];
  let squaresTillEdge = y - 1; //or just y
  while (squaresTillEdge > 0)// or > 0
  {
    let nextChar = board[x][squaresTillEdge];
    console.log("next char to check = " + nextChar);

    //if empty spot - add
    if (nextChar === " ") {
      console.log("next square is empty! Adding it to the array");
      output.push(new Coordinate(x, squaresTillEdge));
    }
    //if enemy piece - add and break
    else if (nextChar >= 'a' && nextChar <= 'z') {
      console.log("enemy detected! Stop the count!");
      output.push(new Coordinate(x, squaresTillEdge));
      break;
    }
    //if friendly piece - break
    else if (nextChar >= 'A' && nextChar <= 'Z') {
      console.log("ally detected! Stop the count!");
      break;
    }
      squaresTillEdge--;
  }
  console.log("North has " + output + " available positions. Size: " + output.length);
  return output;
}

function addPiece(piece, coordinates){
  var img = document.createElement("img");
  img.src = "green_circle.png";
  img.className = "legal-move-space-img"
  var src = piece.ownerDocument.getElementById(coordinates.getSquareName());
  console.log("Coordinates of the piece added = " +"; The element = " + src)
  src.appendChild(img);
}
class Coordinate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getSquareName(){
    let letterX = String.fromCharCode(this.x+97);
    console.log("squareName = "+ ""+letterX+this.y);
    return ""+letterX+this.y;
  }

}
