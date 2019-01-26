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
  let myClientTag = "";
  let players = [];
  let myUserName = "";
  let playerNum = "";
  let myWins = 0;
  let myGamesPlayed = 0;
  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      const con = connectionsRef.push(true);
      myClientTag = con.key;
      console.log(myClientTag);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
  connectionsRef.on("value", function(snap) {
    const connectionArr = Object.keys(JSON.parse(JSON.stringify(snap)));
    if (connectionArr.length <= 2) {
      players = connectionArr;
      if (myClientTag === players[0]) playerNum = "Player1";
      if (myClientTag === players[1]) playerNum = "Player2";
      $("#game").empty().append(`<form id="selection">
        <input type="radio" name="rps" value="Rock" id="rock" class="RPS-btn">
        <label for="rock">Rock</label>
        <input type="radio" name="rps" value="Paper" id="paper" class="RPS-btn">
        <label for="paper">Paper</label>
        <input type="radio" name="rps" value="Scissors" id="scissors" class="RPS-btn">
        <label for="scissors">Scissors</label><br>
        <div id="btn-selected"></div>
        <input type="submit" value="Ready">
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
          <input type="submit" value="Ready">
          </form>`);
      }
    }
    $("#competitors").text(players);
    $("#users-list").text(connectionArr);
  });
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
  const newUser = name =>
    database.ref(`/users/${name}`).set({
      name: name,
      wins: 0,
      gamesPlayed: 0
    });
  const win = user => {
    myWins++;
    myGamesPlayed++;
    database.ref(`/users/${user}`).update({
      wins: myWins,
      gamesPlayed: myGamesPlayed
    });
  };
  const loseTie = user => {
    myGamesPlayed++;
    database.ref(`/users/${user}`).update({
      gamesPlayed: myGamesPlayed
    });
  };
  database.ref("/currentGame").on("value", function(snap) {
    if (snap.val()) {
      if (Object.keys(snap.val()).length < 2) {
        $("#jumbotron").text(
          `${Object.keys(
            snap.val()
          )[0].toUpperCase()} HAS LOCKED IN THEIR CHOICE`
        );
      } else {
        let winner = RPS(snap.val().Player1.choice, snap.val().Player2.choice);
        console.log(playerNum, snap.val().Player1.choice);
        console.log(playerNum, snap.val().Player2.choice);
        if (playerNum === winner) {
          $("#jumbotron").text("YOU WON!");
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        } else if (playerNum === "") {
          $("#jumbotron").text(`${winner.toUpperCase()} HAS WON!`);
        } else {
          $("#jumbotron").text("YOU LOST..");
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        }
      }
    } else {
      $("#new-game").remove();
    }
  });
  $(document).on("submit", "#selection", function(event) {
    event.preventDefault();
    database.ref(`/currentGame/${playerNum}`).set({
      choice: $("input[name=rps]:checked").val()
    });
  });
  $(document).on("click", "#new-game", function() {
    $("#new-game").remove();
    $("#jumbotron").text("NEW GAME");
    database.ref("/currentGame").remove();
  });
});
