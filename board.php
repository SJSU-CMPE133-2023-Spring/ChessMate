<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My First Webpage</title>
    <link rel="stylesheet" href="chess.css">
  </head>

  <body>

<div id="chessboard">
    <?php
        $isWhite = true;
        for ($row = 8; $row>=1; $row--){
            echo '<div class="row">
            ';
            for ($column = 1; $column<=8; $column++){
                if($isWhite == true) {
                    echo '<div id="',$column,$row,'"class="square white"></div>
            ';
                    $isWhite = false;
                } else {
                    echo '<div id="',$column,$row,'"class="square black"></div>
            ';
                    $isWhite = true;
                }
           }
           $isWhite = !$isWhite;
           echo '
    </div>
    ';
        }
    ?>
</div>

</body>
</html>
