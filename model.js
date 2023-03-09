function pieceClicked(element){
  setBoard("R7/PP4PP/8/8/R5R1/8/8/RPR5");
  element.parentElement.style.background="#FF0000";
  console.log(element.id+"_"+element.parentElement.id); //element.parentElement
}

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
  console.log(newBoard);
}
