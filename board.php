<?php
require_once("DBActions/DataBaseActions.php");
if ($_GET and $_GET["gameid"] and $_GET["color"])
    ;

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <title>Chessmate</title>
    <link rel="stylesheet" href="chess.css">
        <a href="board.php">
            <img src="Chessmate_logo.PNG" class="logo" alt="chessmate logo">
        </a>


</head>



<body id="game_page">

    <!-- TODO: replace the table below with a structure of divs (on a separate branch).
      Stage 1:
      * Every div should be a class of "square" or something like that,
      * they should have fixed sizes or scale
      * they should display an image of class "piece" in the center, "legal-move" above anything else,
      * the board coloring should be made with a js function color() that takes 1 boolean argument
          where 1 is white and 0 is black (something like "boolean drawFromWhitePerspective").
      (Later at Stage 2: there should be also a way to highlight the square for a hint,
          and an image of class "comment" must be shown in the right top corner of the square)
          -->
    <div class="flex-container1">
        <div class="column left">
        <div class="board" id="board">
            <div class="row">
                <div class="white square" id="a8_parent">
                    <div class="superscript" id="a8_superscript"></div>
                    <div class="pieceholder" id="a8"></div>
                    <div class="tilenumber">8</div>
                </div>
                <div class="black square" id="b8_parent">
                    <div class="superscript" id="b8_superscript"></div>
                    <div class="pieceholder" id="b8"></div>
                </div>
                <div class="white square" id="c8_parent">
                    <div class="superscript" id="c8_superscript"></div>
                    <div class="pieceholder" id="c8"></div>
                </div>
                <div class="black square" id="d8_parent">
                    <div class="superscript" id="d8_superscript"></div>
                    <div class="pieceholder" id="d8"></div>
                </div>
                <div class="white square" id="e8_parent">
                    <div class="superscript" id="e8_superscript"></div>
                    <div class="pieceholder" id="e8"></div>
                </div>
                <div class="black square" id="f8_parent">
                    <div class="superscript" id="f8_superscript"></div>
                    <div class="pieceholder" id="f8"></div>
                </div>
                <div class="white square" id="g8_parent">
                    <div class="superscript" id="g8_superscript"></div>
                    <div class="pieceholder" id="g8"></div>
                </div>
                <div class="black square" id="h8_parent">
                    <div class="superscript" id="h8_superscript"></div>
                    <div class="pieceholder" id="h8"></div>
                </div>
            </div>
            <div class="row">
                <div class="black square" id="a7_parent">
                    <div class="superscript" id="a7_superscript"></div>
                    <div class="pieceholder" id="a7"></div>
                    <div class="tilenumber">7</div>
                </div>
                <div class="white square" id="b7_parent">
                    <div class="superscript" id="b7_superscript"></div>
                    <div class="pieceholder" id="b7"></div>
                </div>
                <div class="black square" id="c7_parent">
                    <div class="superscript" id="c7_superscript"></div>
                    <div class="pieceholder" id="c7"></div>
                </div>
                <div class="white square" id="d7_parent">
                    <div class="superscript" id="d7_superscript"></div>
                    <div class="pieceholder" id="d7"></div>
                </div>
                <div class="black square" id="e7_parent">
                    <div class="superscript" id="e7_superscript"></div>
                    <div class="pieceholder" id="e7"></div>
                </div>
                <div class="white square" id="f7_parent">
                    <div class="superscript" id="f7_superscript"></div>
                    <div class="pieceholder" id="f7"></div>
                </div>
                <div class="black square" id="g7_parent">
                    <div class="superscript" id="g7_superscript"></div>
                    <div class="pieceholder" id="g7"></div>
                </div>
                <div class="white square" id="h7_parent">
                    <div class="superscript" id="h7_superscript"></div>
                    <div class="pieceholder" id="h7"></div>
                </div>
            </div>
            <div class="row">
                <div class="white square" id="a6_parent">
                    <div class="superscript" id="a6_superscript"></div>
                    <div class="pieceholder" id="a6"></div>
                    <div class="tilenumber">6</div>
                </div>
                <div class="black square" id="b6_parent">
                    <div class="superscript" id="b6_superscript"></div>
                    <div class="pieceholder" id="b6"></div>
                </div>
                <div class="white square" id="c6_parent">
                    <div class="superscript" id="c6_superscript"></div>
                    <div class="pieceholder" id="c6"></div>
                </div>
                <div class="black square" id="d6_parent">
                    <div class="superscript" id="d6_superscript"></div>
                    <div class="pieceholder" id="d6"></div>
                </div>
                <div class="white square" id="e6_parent">
                    <div class="superscript" id="e6_superscript"></div>
                    <div class="pieceholder" id="e6"> </div>
                </div>
                <div class="black square" id="f6_parent">
                    <div class="superscript" id="f6_superscript"></div>
                    <div class="pieceholder" id="f6"></div>
                </div>
                <div class="white square" id="g6_parent">
                    <div class="superscript" id="g6_superscript"></div>
                    <div class="pieceholder" id="g6"></div>
                </div>
                <div class="black square" id="h6_parent">
                    <div class="superscript" id="h6_superscript"></div>
                    <div class="pieceholder" id="h6"></div>
                </div>
            </div>
            <div class="row">
                <div class="black square" id="a5_parent">
                    <div class="superscript" id="a5_superscript"></div>
                    <div class="pieceholder" id="a5"></div>
                    <div class="tilenumber">5</div>
                </div>
                <div class="white square" id="b5_parent">
                    <div class="superscript" id="b5_superscript"></div>
                    <div class="pieceholder" id="b5"></div>
                </div>
                <div class="black square" id="c5_parent">
                    <div class="superscript" id="c5_superscript"></div>
                    <div class="pieceholder" id="c5"></div>
                </div>
                <div class="white square" id="d5_parent">
                    <div class="superscript" id="d5_superscript"></div>
                    <div class="pieceholder" id="d5"></div>
                </div>
                <div class="black square" id="e5_parent">
                    <div class="superscript" id="e5_superscript"></div>
                    <div class="pieceholder" id="e5"></div>
                </div>
                <div class="white square" id="f5_parent">
                    <div class="superscript" id="f5_superscript"></div>
                    <div class="pieceholder" id="f5"></div>
                </div>
                <div class="black square" id="g5_parent">
                    <div class="superscript" id="g5_superscript"></div>
                    <div class="pieceholder" id="g5"></div>
                </div>
                <div class="white square" id="h5_parent">
                    <div class="superscript" id="h5_superscript"></div>
                    <div class="pieceholder" id="h5"></div>
                </div>
            </div>
            <div class="row">
                <div class="white square" id="a4_parent">
                    <div class="superscript" id="a4_superscript"></div>
                    <div class="pieceholder" id="a4"></div>
                    <div class="tilenumber">4</div>
                </div>
                <div class="black square" id="b4_parent">
                    <div class="superscript" id="b4_superscript"></div>
                    <div class="pieceholder" id="b4"></div>
                </div>
                <div class="white square" id="c4_parent">
                    <div class="superscript" id="c4_superscript"></div>
                    <div class="pieceholder" id="c4"></div>
                </div>
                <div class="black square" id="d4_parent">
                    <div class="superscript" id="d4_superscript"></div>
                    <div class="pieceholder" id="d4"></div>
                </div>
                <div class="white square" id="e4_parent">
                    <div class="superscript" id="e4_superscript"></div>
                    <div class="pieceholder" id="e4"></div>
                </div>
                <div class="black square" id="f4_parent">
                    <div class="superscript" id="f4_superscript"></div>
                    <div class="pieceholder" id="f4"></div>
                </div>
                <div class="white square" id="g4_parent">
                    <div class="superscript" id="g4_superscript"></div>
                    <div class="pieceholder" id="g4"></div>
                </div>
                <div class="black square" id="h4_parent">
                    <div class="superscript" id="h4_superscript"></div>
                    <div class="pieceholder" id="h4"></div>
                </div>
            </div>
            <div class="row">
                <div class="black square" id="a3_parent">
                    <div class="superscript" id="a3_superscript"></div>
                    <div class="pieceholder" id="a3"></div>
                    <div class="tilenumber">3</div>
                </div>
                <div class="white square" id="b3_parent">
                    <div class="superscript" id="b3_superscript"></div>
                    <div class="pieceholder" id="b3"></div>
                </div>
                <div class="black square" id="c3_parent">
                    <div class="superscript" id="c3_superscript"></div>
                    <div class="pieceholder" id="c3"></div>
                </div>
                <div class="white square" id="d3_parent">
                    <div class="superscript" id="d3_superscript"></div>
                    <div class="pieceholder" id="d3"></div>
                </div>
                <div class="black square" id="e3_parent">
                    <div class="superscript" id="e3_superscript"></div>
                    <div class="pieceholder" id="e3"></div>
                </div>
                <div class="white square" id="f3_parent">
                    <div class="superscript" id="f3_superscript"></div>
                    <div class="pieceholder" id="f3"></div>
                </div>
                <div class="black square" id="g3_parent">
                    <div class="superscript" id="g3_superscript"></div>
                    <div class="pieceholder" id="g3"></div>
                </div>
                <div class="white square" id="h3_parent">
                    <div class="superscript" id="h3_superscript"></div>
                    <div class="pieceholder" id="h3"></div>
                </div>
            </div>
            <div class="row">
                <div class="white square" id="a2_parent">
                    <div class="superscript" id="a2_superscript"></div>
                    <div class="pieceholder" id="a2"></div>
                    <div class="tilenumber">2</div>
                </div>
                <div class="black square" id="b2_parent">
                    <div class="superscript" id="b2_superscript"></div>
                    <div class="pieceholder" id="b2"></div>
                </div>
                <div class="white square" id="c2_parent">
                    <div class="superscript" id="c2_superscript"></div>
                    <div class="pieceholder" id="c2"></div>
                </div>
                <div class="black square" id="d2_parent">
                    <div class="superscript" id="d2_superscript"></div>
                    <div class="pieceholder" id="d2"></div>
                </div>
                <div class="white square" id="e2_parent">
                    <div class="superscript" id="e2_superscript"></div>
                    <div class="pieceholder" id="e2"></div>
                </div>
                <div class="black square" id="f2_parent">
                    <div class="superscript" id="f2_superscript"></div>
                    <div class="pieceholder" id="f2"></div>
                </div>
                <div class="white square" id="g2_parent">
                    <div class="superscript" id="g2_superscript"></div>
                    <div class="pieceholder" id="g2"></div>
                </div>
                <div class="black square" id="h2_parent">
                    <div class="superscript" id="h2_superscript"></div>
                    <div class="pieceholder" id="h2"></div>
                </div>
            </div>
            <div class="row">
                <div class="black square" id="a1_parent">
                    <div class="superscript" id="a1_superscript"></div>
                    <div class="pieceholder" id="a1"></div>
                    <div class="tilenumber">1</div>
                    <div class="tileletter">a</div>
                </div>
                <div class="white square" id="b1_parent">
                    <div class="superscript" id="b1_superscript"></div>
                    <div class="pieceholder" id="b1"></div>
                    <div class="tileletter">b</div>
                </div>
                <div class="black square" id="c1_parent">
                    <div class="superscript" id="c1_superscript"></div>
                    <div class="pieceholder" id="c1"></div>
                    <div class="tileletter">c</div>
                </div>
                <div class="white square" id="d1_parent">
                    <div class="superscript" id="d1_superscript"></div>
                    <div class="pieceholder" id="d1"></div>
                    <div class="tileletter">d</div>
                </div>
                <div class="black square" id="e1_parent">
                    <div class="superscript" id="e1_superscript"></div>
                    <div class="pieceholder" id="e1"></div>
                    <div class="tileletter">e</div>
                </div>
                <div class="white square" id="f1_parent">
                    <div class="superscript" id="f1_superscript"></div>
                    <div class="pieceholder" id="f1"></div>
                    <div class="tileletter">f</div>
                </div>
                <div class="black square" id="g1_parent">
                    <div class="superscript" id="g1_superscript"></div>
                    <div class="pieceholder" id="g1"></div>
                    <div class="tileletter">g</div>
                </div>
                <div class="white square" id="h1_parent">
                    <div class="superscript" id="h1_superscript"></div>
                    <div class="pieceholder" id="h1"></div>
                    <div class="tileletter">h</div>
                </div>
            </div>

        </div>

        </div>

        <div class="column right">
        <img src="reverse.png" id="rotate-img" class=menu-image alt="menu button rotate the board">
            <div class="flex-container2">
                <div class="dropdown">
                    <button onclick="myFunction1()" class="dropbtn">Play</button>
                    <div id="myDropdown" class="dropdown-content">
                        <a href="#home">Play</a>
                        <a href="#about">Computer</a>
                        <a href="#contact">Practice</a>
                    </div>
                </div>
                <div class="dropdown">
                    <button onclick="myFunction2()" class="dropbtn">Puzzles</button>
                    <div id="myDropdown2" class="dropdown-content">
                        <a href="#home">Puzzles</a>
                        <a href="#about">Daily Puzzle</a>
                        <a href="#contact">Previous Puzzles</a>
                    </div>
                </div>
                <div class="dropdown">
                    <button onclick="myFunction3()" class="dropbtn">Custom</button>
                    <div id="myDropdown3" class="dropdown-content">
                        <a href="#home">Create</a>
                        <a href="#about">Watch</a>

                    </div>
                </div>
            </div>
        </div>
    </div>


    <?php
    if ($_GET) {
        echo '<h2>Your color is: <div id="color">' . $_GET["color"] . '</div></h2>
                <h2>Game ID: <div id="gameID">' . $_GET["gameid"] . '</div></h2>';
    }
    ?>

    <script>
    document.getElementById('rotate-img').addEventListener('click', function () {
        flipHTMLBoard();
    });
        function myFunction1() {
            document.getElementById("myDropdown").classList.toggle("show");
        }

        function myFunction2() {
            document.getElementById("myDropdown2").classList.toggle("show");
        }

        function myFunction3() {
            document.getElementById("myDropdown3").classList.toggle("show");
        }

        // Close the dropdown if the user clicks outside of it
        window.onclick = function (event) {
            if (!event.target.matches('.dropbtn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
    </script>
    <script src="model.js">
    </script>
</body>
<footer>
    <div>
        Team 4
    </div>
</footer>
</html>