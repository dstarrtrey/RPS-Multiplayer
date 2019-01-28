$(document).ready(function() {
  const config = {
    apiKey: "AIzaSyDTnCFa94WD0BWq94DqXBF1EghYagnuEC8",
    authDomain: "rps-multiplayer-f351e.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-f351e.firebaseio.com",
    projectId: "rps-multiplayer-f351e",
    storageBucket: "rps-multiplayer-f351e.appspot.com",
    messagingSenderId: "351356902151"
  };
  firebase.initializeApp(config);
  const database = firebase.database();
  //List of all connections
  const connectionsRef = database.ref("/connections");
  const connectedRef = database.ref(".info/connected");
  let userList = {};
  let myClientTag = "";
  let players = [];
  let myUserName = "Guest";
  let playerNum = "Guest";
  let myWins = 0;
  let myGamesPlayed = 0;
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //----Firebase-Connections----Firebase-Connections----Firebase-Connections----Firebase-Connections------------------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      const con = connectionsRef.push(true);
      myClientTag = con.key;
      console.log("my client tag: ", myClientTag);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
  connectionsRef.on("value", function(snap) {
    const connectionArr = Object.keys(JSON.parse(JSON.stringify(snap)));
    if (connectionArr.length <= 2) {
      players = connectionArr;
      if (myClientTag === players[0]) {
        playerNum = "Player1";
        players[0] = myUserName;
      } else if (myClientTag === players[1]) {
        playerNum = "Player2";
        players[1] = myUserName;
      }
      $("#username").text(playerNum);
      console.log("my player num: ", playerNum);
      $("#game").empty().append(`<form id="selection">
        <input type="radio" name="rps" value="Rock" id="rock" class="RPS-btn">
        <label for="rock">Rock</label>
        <input type="radio" name="rps" value="Paper" id="paper" class="RPS-btn">
        <label for="paper">Paper</label>
        <input type="radio" name="rps" value="Scissors" id="scissors" class="RPS-btn">
        <label for="scissors">Scissors</label><br>
        <div id="btn-selected"></div>
        <input id="game-submit" type="submit" value="Ready">
        </form>`);
    } else {
      players = connectionArr.slice(0, 2);
      if (!players.includes(myClientTag)) {
        $("#game")
          .empty()
          .append("<h1>You are a spectator</h1>");
      } else {
        $("#game").empty().append(`<form id="selection">
          <input type="radio" name="rps" value="Rock" id="rock" class="RPS-btn">
          <label for="rock">Rock</label>
          <input type="radio" name="rps" value="Paper" id="paper" class="RPS-btn">
          <label for="paper">Paper</label>
          <input type="radio" name="rps" value="Scissors" id="scissors" class="RPS-btn">
          <label for="scissors">Scissors</label><br>
          <div id="btn-selected"></div>
          <input id="game-submit" type="submit" value="Ready">
          </form>`);
      }
    }
    $("#competitors").text(players);
    $("#users-list").text(connectionArr.length);
  });
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //----Gameplay----Gameplay----Gameplay----Gameplay----Gameplay----Gameplay----Gameplay----Gameplay----Gameplay------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  const RPS = (user1RPS, user2RPS) => {
    if (user1RPS === user2RPS) {
      return "tie";
    } else if (
      (user1RPS === "Rock" && user2RPS === "Scissors") ||
      (user1RPS === "Paper" && user2RPS === "Rock") ||
      (user1RPS === "Scissors" && user2RPS === "Paper")
    ) {
      return "Player1";
    } else if (
      (user2RPS === "Rock" && user1RPS === "Scissors") ||
      (user2RPS === "Paper" && user1RPS === "Rock") ||
      (user2RPS === "Scissors" && user1RPS === "Paper")
    ) {
      return "Player2";
    } else {
      return "input error";
    }
  };
  const win = user => {
    myWins++;
    myGamesPlayed++;
    $("#about-me").text(
      `My wins: ${myWins}———My Games Played: ${myGamesPlayed}`
    );
    database.ref(`/users/${user}`).update({
      name: user,
      wins: myWins,
      gamesPlayed: myGamesPlayed
    });
  };
  const loseTie = user => {
    myGamesPlayed++;
    $("#about-me").text(
      `My wins: ${myWins}———My Games Played: ${myGamesPlayed}`
    );
    database.ref(`/users/${user}`).update({
      name: user,
      wins: myWins,
      gamesPlayed: myGamesPlayed
    });
  };
  database.ref("/currentGame").on("value", function(snap) {
    if (snap.val()) {
      //If only one user has submitted
      if (Object.keys(snap.val()).length < 2) {
        $("#jumbotron").text(
          `${Object.keys(
            snap.val()
          )[0].toUpperCase()} HAS LOCKED IN THEIR CHOICE`
        );
      } else {
        //if both have
        let winner = RPS(snap.val().Player1.choice, snap.val().Player2.choice);
        console.log(playerNum, snap.val().Player1.choice);
        console.log(playerNum, snap.val().Player2.choice);
        if (playerNum === winner) {
          $("#jumbotron").text("YOU WON!");
          win(myUserName);
          $("#game-submit").remove();
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        } else if (playerNum === "") {
          $("#jumbotron").text(`${winner.toUpperCase()} HAS WON!`);
        } else if (winner === "tie" && playerNum !== "Guest") {
          $("#game-submit").remove();
          console.log(playerNum);
          $("#jumbotron").text("TIE");
          loseTie(myUserName);
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        } else if (winner === "tie" && playerNum === "Guest") {
          $("#jumbotron").text("TIE");
        } else {
          $("#game-submit").remove();
          loseTie(myUserName);
          $("#jumbotron").text("YOU LOST..");
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        }
      }
    } else {
      //if there are 0 submitted users (new game)
      $("#jumbotron").text("NEW GAME");
      $("#new-game").remove();
      $("#game-submit").remove();
      $("#selection").append(
        $("<input>")
          .attr("id", "game-submit")
          .attr("type", "submit")
          .val("Ready")
      );
    }
  });
  $(document).on("submit", "#selection", function(event) {
    event.preventDefault();
    database.ref(`/currentGame/${playerNum}`).set({
      choice: $("input[name=rps]:checked").val()
    });
  });
  $(document).on("click", "#new-game", function() {
    database.ref("/currentGame").remove();
  });
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //----User-Info----User-Info----User-Info----User-Info----User-Info----User-Info----User-Info----User-Info----------
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  const newUser = name => {
    database.ref(`/users/${name}`).set({
      name: name,
      wins: 0,
      gamesPlayed: 0
    });
    myUserName = name;
    myWins = userList[myUserName].wins;
    myGamesPlayed = userList[myUserName].gamesPlayed;
  };
  database.ref("/currentPlayers").on("value", function(snap) {
    $("#competitors").text(
      `${snap.val().Player1} (Player 1), ${snap.val().Player2} (Player 2)`
    );
  });
  $(document).on("submit", "#display-name", function(event) {
    event.preventDefault();
    myUserName = $("#usernameText").val();
    $("#username").text(`${myUserName} (${playerNum})`);
    $("#usernameText").val("");
    if (playerNum === "Player1") {
      players[0] = myUserName;
      database.ref("/currentPlayers").update({
        Player1: myUserName
      });
    } else if (playerNum === "Player2") {
      players[1] = myUserName;
      database.ref("/currentPlayers").update({
        Player2: myUserName
      });
    }
  });
  database.ref("/users").on(
    "value",
    function(snap) {
      let leader = { name: "nobody", wins: 0, gamesPlayed: 0 };
      Object.keys(snap.val()).forEach(user => {
        if (snap.val()[user].wins > leader.wins) {
          leader = snap.val()[user];
        }
      });
      $("#leaderboard").text(
        `Top Player: ${leader.name}—${leader.wins} Wins | ${
          leader.gamesPlayed
        } Games Played`
      );
      console.log("leader: ", leader);
      console.log("userSnap: ", snap.val());
    },
    function(errorMsg) {
      console.log("Errors handled: ", errorMsg);
    }
  );
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  //----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat----Chat--
  //------------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------------
  const timestamp = () => moment().format("MM/DD [at] hh:mm a");
  database.ref("/chatLog").on("value", function(snap) {
    $("#chat-log").empty();
    const log = $("<div>");
    console.log(snap.val());
    if (Object.keys(snap.val()).length >= 10) {
      for (
        let x = Object.keys(snap.val()).length - 1;
        x > Object.keys(snap.val()).length - 11;
        x--
      ) {
        log.append(
          $("<div>").text(snap.val()[Object.keys(snap.val())[x]].message)
        );
      }
    } else {
      for (let x = Object.keys(snap.val()).length - 1; x >= 0; x--) {
        log.append(
          $("<div>").text(snap.val()[Object.keys(snap.val())[x]].message)
        );
      }
    }
    $("#chat-log").append(log);
  });
  $(document).on("submit", "#my-chat", function(event) {
    event.preventDefault();
    if (
      $("#chat-area")
        .val()
        .trim().length > 0
    ) {
      database.ref("/chatLog").push({
        message: `${timestamp()}——${$("#username").text()}►${$("#chat-area")
          .val()
          .trim()}`
      });
      $("#chat-area").val("");
    }
  });
});
