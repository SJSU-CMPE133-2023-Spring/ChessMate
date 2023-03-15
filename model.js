// Controller Variables
let squareSelected = null; //if true, then clicking on a highlighted square = move;


// Model Variables
//var currentPosition = "8/1R5R/R7/8/7R/8/8/5R2";
var board = new Array(8);
//setBoard(currentPosition);
setBoard("8/1R5R/R7/8/7R/8/8/2R2R2");
let gameID = 0;
// Controller Methods
function pieceClicked(element){
  if((squareSelected === null) || (element.parentElement.id !==squareSelected)){
    hideLegalMoves();
    element.parentElement.style.background="#ffd500";
    //cut the piece from the potential id (ex. P_6 -> P);
    let piece = element.id.slice(0,1);
    //cut the letter from the coordinates and transform into a number (ex. "b4" -> 1)
    let x = parseInt(element.parentElement.id.slice(0,1), 36)-10;
    let y = 8-element.parentElement.id.slice(1,2);

    console.log("clickedPiece(piece = "+ piece+", x = "+x+"; y = "+y+";");
    displayLegalMoves(getLegalMoves(piece, x, y));
    console.log("pieceClicked is finished!");
    squareSelected = element.parentElement.id;
  } else {
    hideLegalMoves();
    squareSelected = null;
  }
}

function legalMoveClicked(element){
  //remove the piece from its current position

  
  //remove the piece from the final position (if there is)
  //add the piece to the new position (potential special action - castle, promotion, en passant)
  //hideLegalMoves();
}

function displayLegalMoves(legalMoves){
  console.log("displaying n = "+legalMoves.length+" moves...");
  for (let i = 0; i < legalMoves.length; i++) {
    addLegalMove(new Coordinate(legalMoves[i].x,legalMoves[i].y));
  }
}

function hideLegalMoves(){
  var i, elements = document.getElementsByClassName('legal-move-space-img');
  for (i = elements.length; i--;) {
    elements[i].parentNode.removeChild(elements[i]);
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
  logBoard();
}

function getLegalMoves(pieceType, x, y) {
  let legalMoves = [];

  switch (pieceType) {
    case "R": //for Rook
        legalMoves=(getRookMoves(x, y));
        break;
    case "P":
      console.log("Pawn");

  }
  console.log("GetLegalMoves: total number of moves =  " + legalMoves.length);
  return legalMoves;
}

function getRookMoves(x, y){
  return [...checkNorth(x, y), ...checkSouth(x,y)];
  //return [...checkNorth(x, y), ...checkEast(x, y), ...checkSouth(x, y), ...checkWest(x, y)];
}

function checkNorth(x, y){
  console.log("Checking North... x = " + x + "; y = " + y);
  let output = [];
  let squaresTillEdge = y; //or just y
  while (squaresTillEdge > 0)// or > 0
  {
    squaresTillEdge--;
    let nextChar = board[squaresTillEdge][x]; //not exactly sure why, but there x and y are reversed or it does not work correctly.
    //console.log("next char to check = " + nextChar+" at x = "+x+"; y = "+ squaresTillEdge);

    //if empty spot - add
    if (nextChar === " ") {
      //console.log("next square is empty! Adding it to the array");
      output.push(new Coordinate(x, squaresTillEdge));
    }
    //if enemy piece - add and break
    else if (nextChar >= 'a' && nextChar <= 'z') {
      //console.log("enemy detected! Stop the count!");
      output.push(new Coordinate(x, squaresTillEdge));
      break;
    }
    //if friendly piece - break
    else if (nextChar >= 'A' && nextChar <= 'Z') {
      //console.log("ally detected at x="+x+", y="+squaresTillEdge+"! Stop the count!");
      break;
    }
  }
  console.log("North has " + output + " available positions. Size: " + output.length);
  return output;
}

function checkSouth(x, y){
  console.log("Checking South... x = " + x + "; y = " + y);
  let output = [];
  let squaresTillEdge = y; //or just y
  while (squaresTillEdge < 7)// or > 0
  {
    squaresTillEdge++;
    let nextChar = board[squaresTillEdge][x]; //not exactly sure why, but there x and y are reversed or it does not work correctly.
    //console.log("next char to check = " + nextChar+" at x = "+x+"; y = "+ squaresTillEdge);

    //if empty spot - add
    if (nextChar === " ") {
      //console.log("next square is empty! Adding it to the array");
      output.push(new Coordinate(x, squaresTillEdge));
    }
    //if enemy piece - add and break
    else if (nextChar >= 'a' && nextChar <= 'z') {
      //console.log("enemy detected! Stop the count!");
      output.push(new Coordinate(x, squaresTillEdge));
      break;
    }
    //if friendly piece - break
    else if (nextChar >= 'A' && nextChar <= 'Z') {
      //console.log("ally detected at x="+x+", y="+squaresTillEdge+"! Stop the count!");
      break;
    }
  }
  console.log("South has " + output + " available positions. Size: " + output.length);
  return output;
}


function addLegalMove(coordinates){
  let img = document.createElement("img");
  img.src = "green_circle.png";
  img.className = "legal-move-space-img";
  let src = document.getElementById(coordinates.getSquareName());
  console.log("AddLegalMove: attempting to add a move at parentID = "+coordinates.getSquareName());
  src.appendChild(img);
}

function logBoard(){
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

  getSquareName(){
    //let letterX = String.fromCharCode(this.x+97);
    console.log("GetSquareName: squareName = "+ ""+String.fromCharCode(this.x+97)+(8-this.y));
    return ""+String.fromCharCode(this.x+97)+(8-this.y);
  }

}
