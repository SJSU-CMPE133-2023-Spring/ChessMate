// Controller Variables
var pieceSelected = false; //if true, than clicking on a highlighted square = move;


// Model Variables
var currentPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5";
var board = new Array(8);
//setBoard(currentPosition);

var gameID = 0;
// Controller Methods
function pieceClicked(element){
  if(!pieceSelected){
    element.parentElement.style.background="#00FF00";
    //cut the piece from the potential id (ex. P_6 -> P);
    piece = element.id.slice(0,1);
    //cut the letter from the coordingates and transform into a number (ex. "b4" -> 2)
    x = parseInt(element.parentElement.id.slice(0,1), 36) - 9;
    y = element.parentElement.id.slice(1,2);

    console.log("clickedPiece(piece = "+ piece+", x = "+x+"; y = "+y+";");
    getLegalMoves(piece, x, y);
  }
}


// Model methods
function setBoard(newPosition){
  //newPosition = "R7/PP4PP/8/8/R5R1/8/8/RPR5";
  newBoard = new Array(8);
  const position = newPosition.split("/");

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
  console.log(board);
}
// TODO: this method blocks the code, while it's unfinished
function getLegalMoves(pieceType, x, y){
    switch(pieceType):
      case "R": //for Rook
        for (let sidesToCheck = 4; sidesToCheck!=0; sidesToCheck++){
          // Let 1 be Top (y-i), 2 - Right (x+i), 3 - Bottom (y+i), 4 - Left (x-i);
          switch (sidesToCheck) {
            case 1:
              while ()//
              {
                //if friendly piece - break
                //if enemy piece - add and break
                //if empty spot - add
              }
              break;
            default:

          }
        }
        break;

      case "P":

        break;
      default:

      }
}
