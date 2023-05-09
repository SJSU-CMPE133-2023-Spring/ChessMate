<?php
require_once("DBActions/DataBaseActions.php");
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chessmate</title>
    <link rel="stylesheet" href="chess.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>



<body id="game_page">
    <div class="grid-container-whole">
        <div class="leftmost-column">
            <a href="board.php">

            </a>
        </div>
        <div class="board-column">
            <div class="grid-container-boardside">
                <div class="opponent-panel">
                    <div class="grid-container-black-player-panel">
                        <div class="profile-pic-c" id="opponent-icon">
                        </div>
                        <div class="grid-container-name-captured">
                            <div class="name-c" id="opponent-name">
                            </div>
                            <div class="captured-c" id="opponent-captured">

                            </div>
                        </div>
                        <div class="time-c" id="opponent-time">
                        </div>
                    </div>
                </div>

                <div class="board-container">

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
                    <div class="board-menu">
                        <img src="settings_icon.png" class=menu-image alt="button for extra settings">
                        <img src="reverse.png" id="rotate-img" class=menu-image alt="menu button rotate the board">
                        <img src="show.png" id="show-img" class=menu-image alt="menu button show/hide menu">
                    </div>

                </div>
                <div class="player-panel">

                    <div class=" grid-container-black-player-panel">
                        <div class="profile-pic-c" id="player-icon">
                        </div>
                        <div class="grid-container-name-captured">
                            <div class="name-c" id="player-name">
                            </div>
                            <div class="captured-c" id="player-captured">
                            </div>
                        </div>
                        <div class="time-c" id="player-time">
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="promotion" id="white promotion">
            <img src="pieces/white-queen.png" alt="Q">
            <img src="pieces/white-rook.png" alt="R">
            <img src="pieces/white-bishop.png" alt="B">
            <img src="pieces/white-knight.png" alt="N">
        </div>
        <div class="promotion" id="black promotion">
            <img src="pieces/black-queen.png" alt="q">
            <img src="pieces/black-rook.png" alt="r">
            <img src="pieces/black-bishop.png" alt="b">
            <img src="pieces/black-knight.png" alt="n">
        </div>

        <div class="menu-column" id="menu-column">
            <div class="login-container" id="login-container">
                <p id="user-name">Guest</p>
                <button onclick="switchContainerView('initial-menu', 'login-menu')" id="login-button" class="login-register-button">Log in</button>
                <button onclick="switchContainerView('initial-menu', 'registration-menu')" id="sign-up-button" class="login-register-button">Sign up</button>
                <button onclick="signOut()" id="sigh-out-button" class="login-register-button hidden" style="transform: translateX(9vh);">Sign out</button>
            </div>
            <img src="Chessmate_logo.PNG" class="logo" alt="chessmate logo">
            <div class="dynamic-menu-container">
                <div class="dynamic-menu-group" id="initial-menu">
                    <button class="dynamic-menu-element" id="start-classic">Classic Match</button>
                    <button class="dynamic-menu-element" id="start-ranked">Ranked Game</button>
                    <button class="dynamic-menu-element" id="start-engine">vs Computer</button>
                    <button class="dynamic-menu-element" onclick="switchContainerView('initial-menu', 'leaderboard-menu'); updatePlayersTable();">Leaderboard</button>

                </div>
                <div class="dynamic-menu-group hidden" id="leaderboard-menu">
                    <button class="dynamic-menu-back-button" onclick="switchContainerView('leaderboard-menu', 'initial-menu')">back</button>
                    <div class=dynamic-menu-element style="font-size: 3vh">Leaderboard</div>
                    <div class="table-container">
                        <table id="playersTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="dynamic-menu-group hidden" id="online-game-menu">
                    <button class="dynamic-menu-element" id="quit-button" onclick="quitGameOnclick()">Resign</button>
                    <div class="dynamic-menu-element hidden" style="font-size: 2.5vh" id="draw-offer-message">Opponent offered a draw</div>
                    <button class="dynamic-menu-element" onclick="offerDraw()" id="offer-draw-button">Offer Draw</button>

                </div>
                <div class="dynamic-menu-group hidden" id="engine-game-menu">
                    <button class="dynamic-menu-element" onclick="quitGameOnclick()">Resign</button>
                    <button class="dynamic-menu-element" onclick="offerDraw()">Offer Draw</button>
                    <button class="dynamic-menu-element">Get Hint</button>
                </div>
                <div class="dynamic-menu-group hidden" id="waiting-game-menu">
                    <button class="dynamic-menu-element" id="cancel-button">Cancel</button>
                    <div class=dynamic-menu-element style="font-size: 3vh">Searching for an opponent</div>
                    <img src="searching_opponent.gif" class="logo" style="padding-top:0; width:100%" alt="searching for opponent animation">

                </div>
                <div class="dynamic-menu-group hidden" id="login-menu">
                    <button class="dynamic-menu-back-button" id="back-button" onclick="switchContainerView('login-menu', 'initial-menu'); toggleErrorMessage('');">Back</button>

                    <div class="dynamic-menu-element" style="padding: 5px">Log in</div>
                    <form id="login-reguster-form" onsubmit="handleSubmit(event);">
                    <input type="hidden" id="operation" value="login" name="operation">
                        <div class="dynamic-menu-element">
                            <div class="label-field-container">
                                <div class="label-container">
                                    <label style="padding-left: 0" for="login">Login:</label>
                                </div>
                                <div class="input-container">
                                    <input type="text" id="login" name="login" pattern="[A-Za-z0-9]+" required title="Please enter only letters and numbers, no spaces or special characters">
                                </div>
                            </div>
                        </div>
                        <div class="dynamic-menu-element">
                            <div class="label-field-container">
                                <div class="label-container">
                                    <label style="padding-left: 0" for="password" >Password:</label>
                                </div>
                                <div class="input-container">
                                    <input type="password" id="password" name="password" pattern="[A-Za-z0-9]+" required title="Please enter only letters and numbers, no spaces or special characters">
                                </div>
                            </div>
                        </div>
                        <div class="error-message"></div>
                        <button type="submit" class="dynamic-menu-element" style="width: 100%">Log in</button>
                    </form>

                </div>
                <div class="dynamic-menu-group hidden" id="registration-menu">
                    <button class="dynamic-menu-back-button" id="back-button" onclick="switchContainerView('registration-menu', 'initial-menu'); toggleErrorMessage('');">Back</button>
                     <div class="dynamic-menu-element" style="padding: 5px">Sign up</div>
                    <form id="login-register-form" onsubmit="handleSubmit(event);">
                        <input type="hidden" id="operation1" value="registration" name="operation">
                        <div class="dynamic-menu-element">
                            <div class="label-field-container">
                                <div class="label-container">
                                    <label style="padding-left: 0" for="login1">Login:</label>
                                </div>
                                <div class="input-container">
                                    <input type="text" id="login1" name="login" pattern="[A-Za-z0-9]+" required title="Please enter only letters and numbers, no spaces or special characters">
                                </div>
                            </div>
                        </div>
                        <div class="dynamic-menu-element">
                            <div class="label-field-container">
                                <div class="label-container">
                                    <label style="padding-left: 0" for="password1">Password:</label>
                                </div>
                                <div class="input-container">
                                    <input type="password" id="password1" name="password" pattern="[A-Za-z0-9]+" required title="Please enter only letters and numbers, no spaces or special characters">
                                </div>

                            </div>
                        </div>
                        <div class="error-message"></div>
                        <button type="submit" class="dynamic-menu-element" style="width: 100%">Register</button>
                    </form>

                </div>


            </div>
        </div>
        <div class="rightmost-column">
        </div>




        <script>
        document.getElementById('rotate-img').addEventListener('click', function () {
            flipHTMLBoard(true);
        });
        document.getElementById('show-img').addEventListener('click', function () {
            toggleContainer();
        });
        document.getElementById('start-classic').addEventListener('click', function(){
            startClassicButtonOnClick();
        });
        document.getElementById('start-ranked').addEventListener('click', function(){
            startRankedButtonOnClick();
        });

        document.getElementById('start-engine').addEventListener('click', function(){
            startEngineButtonOnClick();
        });
        function toggleContainer() {
            let container = document.getElementById("menu-column");

                container.classList.toggle("hidden");

        }
        function myFunction1() {
            document.getElementById("myDropdown").classList.toggle("show");
        }

        function myFunction2() {
            document.getElementById("myDropdown2").classList.toggle("show");
        };

        function myFunction3() {
            document.getElementById("myDropdown3").classList.toggle("show");
        };


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



function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const login = form.elements["login"].value;
    const password = form.elements["password"].value;
    const operation = form.elements["operation"].value;

    const url = `DBActions/login_register.php?operation=${encodeURIComponent(operation)}&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;

    fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
    .then(response => response.text())
    .then(text => {

        // Process the response data
        if (!isNaN(text)) {
            toggleErrorMessage(''); // Hide the error message
            console.log("Successful login. ID = " + text);
            document.getElementById("player-id").innerHTML = text;
            switchContainerView(operation + '-menu', 'initial-menu');
            //show player's name
            document.getElementById("user-name").innerHTML = login;
            //replace "login" and "sign up" buttons with "sign out"
            document.getElementById("sigh-out-button").classList.remove('hidden');
            document.getElementById("login-button").classList.add('hidden');
            document.getElementById("sign-up-button").classList.add('hidden');

        } else {
            console.log(text);
            toggleErrorMessage(text);

        }
    }).catch(error => {
        console.error("Error:", error);
    });
}
function toggleErrorMessage(message) {
    const errorMessageElement = document.querySelector('.error-message');

    if (message) {
        // Show the error message
        errorMessageElement.innerHTML = message;
        errorMessageElement.style.display = 'block';
    } else {
        // Hide the error message
        errorMessageElement.innerHTML = '';
        errorMessageElement.style.display = 'none';
    }
}

function switchContainerView(hideID, showID) {
    document.getElementById(hideID).classList.add('hidden');
    document.getElementById(showID).classList.remove('hidden');

    // Hide/show login/registration container between scenes
    if (hideID === "initial-menu") {
        $(".login-register-button").css("visibility", "hidden");
    }
    if (showID === "initial-menu") {
        $(".login-register-button").css("visibility", "visible");
    }
}
        function signOut(){
            //change player's name
            document.getElementById("user-name").innerHTML = "Guest";
            //replace "login" and "sign up" buttons with "sign out"
            document.getElementById("sigh-out-button").classList.add('hidden');
            document.getElementById("login-button").classList.remove('hidden');
            document.getElementById("sign-up-button").classList.remove('hidden');
            document.getElementById("player-id").innerHTML = Math.floor(Math.random() * 1000) + 105;
            console.log("Signed Out; New Guest ID =" + document.getElementById("player-id").innerHTML);
        }
async function updatePlayersTable() {
    //ajax call
    const response = await fetch(`DBActions/getLeaderboard.php`);
    const status = await response.text();
    const playersData = JSON.parse(status);
    console.log("response: "+response+"; status: "+status);

    //main function
    const playersTable = document.getElementById('playersTable');
    const tbody = playersTable.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    const currentUserName = document.getElementById('user-name').innerText;
    playersData.forEach(player => {
        const newRow = tbody.insertRow();

        const nameCell = newRow.insertCell();
        const iconImage = document.createElement('img');
        iconImage.src = "icons/"+player.icon;
        iconImage.classList.add('icon');
        nameCell.appendChild(iconImage);

        const nameSpan = document.createElement('span');
        nameSpan.innerText = player.login;
        if (player.login === currentUserName) {
            nameSpan.innerText += ' (you)';
        }
        nameCell.appendChild(nameSpan);

        const ratingCell = newRow.insertCell();
        ratingCell.innerText = player.rating;
    });
}







        </script>
        <script src="model.js">
        </script>
    </div>
<div class="hidden" id="player-id">
    <?php
    if ($_GET){
        echo $_GET['id'];
    } else echo rand();?>
</div>
<div class="hidden" id="queue-status">
    <?php echo "none";   ?>
</div>
</body>

</html>
