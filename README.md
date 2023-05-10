# ChessMate
ChessMate is a web-based application that lets you play chess locally with your friends in classic/ranked with a leaderboard system, or against an elite Stockfish chess AI. 

## Table of contents

- [Project Title](#project-title)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
    - [Built With](#built-with)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgements](#acknowledgements)

## About the Project

We plan to build a web platform for people pationate interested in Chess to have fun and become better. We have ranking online system, friendly communication and challenges, puzzles, ability to play against different levels of AI (from a begginner to a above-pro) and much more.

### Built With

- [Stockfish](https://stockfishchess.org/)

## Getting Started

### Prerequisites

We plan to make our platform available from any device that can open web-pages, but it is in progress. In the current version, you will to locally install the software listed below:

- [Xampp](https://www.apachefriends.org/download.html) version 8.0.5 or higher
- [Stockfish](https://stockfishchess.org/download/) version 15.1 or higher
- [IntelliJ](https://www.jetbrains.com/idea/download/#section=windows) version 2023.1 or higher (we are working on at least making an .exe file instead, so keep in touch with our updates)


### Installation

Step-by-step instructions on how to install the project.

1. Clone the repo

   ```sh
   git clone <https://github.com/SJSU-CMPE133-2023-Spring/ChessMate.git>
   ```

2. Install dependencies

- Install and run Xampp.
  - Inside the app click on "Start" for Apache and MySQL modules.
- Install Stockfish and add the archive to the folder called "Stockfish".
  - Run import StockfishManager folder as a new project in IntelliJ IDEA and run it.

3. Setting Up

- Move all the files from our repository to xampp/htdocs folder
- Inside XAMMP app, click on admin button under the Apache module which opens a tab to localhost in your browser
- Inside the localhost tab, go to [localhost](localhost/)/ChessMate folder and click on board.php
- You will see the fully functional main screen

### Usage

This section should provide examples or instructions on how to use the project. Provide any information that the user may need to know before getting started, such as expected inputs and outputs, important features or limitations, and so on.

ChessMate Features:
- Sign up/Login
- Sandbox mode in main menu
- Play Classic/Ranked Game
- Play against Stockfish AI
- View skill ratings leaderboard

Expected Inputs:
The user will need to know how to play chess, which involves understanding the basic legal chess rules and how to move the pieces. They will need to use a desktop computer or laptop to be able to run start the XAMPP server and establish connection to the database. The user must also have a browser in order to open localhost and browse the project files. To play against Stockfish AI, it is required to open the StockfishManager project folder inside of any IDE and run main to start the engine.

Limitations:

- ChessMate is not available on handheld mobile devices
- If user does not know how to start the web server or perform installation, they are not able to access the game
- Playing against Stockfish AI is dependent on having an IDE to start the engine

Expected Outputs:
The output of the game is the current state of the board and the current player's turn. The user can make a move by selecting a piece and then selecting the square they want to move to. The game will validate the move and update the board accordingly. If a piece is captured within the last turn, the captured piece will be added to the captured pieces display under the player's name. When the game ends, the user will see a message indicating they won/loss by checkmate, by time, by resignation, or by a draw when offered and accepted. If playing a ranked game, both users will see a message of how much their rating fluctuated at the end of the game, which is updated and viewable through the leaderboard.

ChessMate is a great way to improve your chess skills by playing against your friends locally, against yourself, or to test your limits against and advanced Chess AI.

### Roadmap

Here you can outline any future plans or improvements for the project. This can include bug fixes, new features, or any other changes that are planned.

These improvements can make ChessMate more engaging, improving the overall experience for players. Currently ChessMate only allows users to play chess against friends or AI, but the addition of these features will add more depth and weight to the game.

1. Adding various difficulty levels for the engine: Currently, ChessMate offers one difficulty level for the engine. The level of the Stockfish AI is   
extremely calculating with its moves, not suitable at all for a new player to go up against. Adding multiple levels can cater to players with different skill levels, from beginners to advanced and even above-pro levels.

2. Hint feature: This feature can provide helpful hints or tips to players who are stuck or need some guidance during the game. This would utilize the Stockfish AI engine to provide the user with a move that the engine would make if it were playing.

3. Chat and friends mechanics: Adding a chat feature can help players communicate with each other during the game if they were not playing nearby (available in a future version). Additionally, adding a friends list feature can enable players to connect with their friends and challenge them to games. We wanted to make the game fully online, but playing matches against other people is restricted to opening multiple tabs on the same computer.

4. Game history: ChessMate can save and display the history of completed games for players to review and analyze their gameplay. In addition, players would be able to choose to play at a particular point in a match against the Stockfish AI that matches the other player's rating at the time. This option would be viewable after the end of a recently completed game, or through the main menu.

5. Analytics: ChessMate can include analytics that provides insights into players' performance, including win/loss records, real-time player evaluation, average time per move, and other useful statistics. 

6. Review matches: Players can watch previous matches to improve their gameplay and learn from their mistakes.

7. Sounds and effects: Adding sounds and visual effects to enhance the gaming experience and make ChessMate more immersive and engaging.

### Contributing

Here you should provide instructions on how other developers can contribute to the project. This should include guidelines for submitting pull requests, coding conventions, and any other relevant information.

To make things simple, we mostly used Github Desktop for pushing code to the repository.
1. Clone the repository to your local machine using GitHub Desktop.
2. Choose the local path to the be in the xampp/htdocs folder.
3. Make your code changes and commit them to main branch.
4. Add an update of what you changed and push the code to origin/main branch.
5. Send a message to the group discord and wait for feedback from other members to address the changes.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

### Contact

Mikhail Fedosenko: https://github.com/SpectRotation
Kevin Knapp: https://github.com/knappkevin
Vinh Nguyen: https://github.com/cousinvinny
Larry Shields: https://github.com/lwshield

### Acknowledgements

[An example of Stockfish implementation in Java](https://github.com/bhlangonijr/chesslib/tree/master/src/main/java/com/github/bhlangonijr/chesslib)
[Resource used to learn HTML/CSS & JavaScript](https://www.w3schools.com/)
