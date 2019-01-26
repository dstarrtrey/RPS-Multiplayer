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
  // When the client's connection state changes...
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
      if (myClientTag === players[0]) playerNum = "Player1";
      else if (myClientTag === players[1]) playerNum = "Player2";
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
  $("#username").append(
    $("<form>")
      .attr("id", "login")
      .append(
        $("<input>")
          .attr("type", "text")
          .attr("id", "usernameInput"),
        $("<input>").attr("type", "submit")
      )
  );
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
  const win = user => {
    myWins++;
    myGamesPlayed++;
    $("#about-me").text(
      `My wins: ${myWins}———My Games Played: ${myGamesPlayed}`
    );
    database.ref(`/users/${user}`).update({
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
          win(myUserName);
          $("#game").append(
            $("<button>")
              .text("New Game")
              .attr("id", "new-game")
          );
        } else if (playerNum === "") {
          $("#jumbotron").text(`${winner.toUpperCase()} HAS WON!`);
        } else if (winner === "tie") {
          $("#jumbotron").text("TIE");
          loseTie(myUserName);
        } else {
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
      $("#new-game").remove();
      $("#jumbotron").text("NEW GAME");
    }
  });
  // database.ref("/users").on("value", function(snap) {
  //   userList = JSON.parse(JSON.stringify(snap));
  //   console.log("userList", userList);
  //   console.log("userList.David", userList.David);
  // });
  // database.ref("/currentPlayers").on("value", function(snap) {
  //   if (snap.val()) {
  //     if (snap.val().Player1 && snap.val().Player2) {
  //       let player1 = snap.val().Player1;
  //       console.log("player1: ", player1);
  //       let player2 = snap.val().Player2;
  //       console.log("player2: ", player2);
  //       $("#player-1").text(
  //         `Player 1: ${player1} | ${userList[player1].wins} Wins | ${
  //           userList[player1].gamesPlayed
  //         } Games Played`
  //       );
  //       $("#player-2").text(
  //         `Player 2: ${player2} | ${userList[player2].wins} Wins | ${
  //           userList[player2].gamesPlayed
  //         } Games Played`
  //       );
  //     }
  //   }
  // });
  $(document).on("submit", "#selection", function(event) {
    event.preventDefault();
    database.ref(`/currentGame/${playerNum}`).set({
      choice: $("input[name=rps]:checked").val()
    });
  });
  // $(document).on("submit", "#login", function(event) {
  //   event.preventDefault();
  //   const input = $("#usernameInput")
  //     .val()
  //     .trim();
  //   if (!Object.keys(userList).includes(input)) {
  //     newUser(input);
  //   } else {
  //     myUserName = input;
  //     myWins = userList[myUserName].wins;
  //     myGamesPlayed = userList[myUserName].gamesPlayed;
  //   }
  //   console.log("My new user: ", myUserName);
  //   $("#username").empty();
  //   $("#username").append(
  //     `${myUserName}`,
  //     $("<button>")
  //       .attr("id", "change-user")
  //       .text("Change User")
  //   );
  //   $("#about-me").text(
  //     `My wins: ${myWins}———My Games Played: ${myGamesPlayed}`
  //   );
  //   if (playerNum === "Player1") {
  //     database.ref("/currentPlayers").update({
  //       Player1: myUserName
  //     });
  //   } else if (playerNum === "Player2") {
  //     database.ref("/currentPlayers").update({
  //       Player2: myUserName
  //     });
  //   }
  // });
  $(document).on("click", "#new-game", function() {
    $("#new-game").remove();
    database.ref("/currentGame").remove();
  });
  //-------------------------------------------------------------------------
  //-----------------------------------Chat----------------------------------
  //-------------------------------------------------------------------------
  const timestamp = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return `${month}/${day}/${year} at ${hour}:${minute}`;
  };
  database.ref("/chatLog").on("value", function(snap) {
    $("#chat-log").empty();
    const log = $("<div>");
    console.log(snap.val());
    for (
      let x = Object.keys(snap.val()).length - 1;
      x > Object.keys(snap.val()).length - 11;
      x--
    ) {
      log.append(
        $("<div>").text(snap.val()[Object.keys(snap.val())[x]].message)
      );
      console.log(snap.val()[Object.keys(snap.val())[x]].message);
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
        message: `${timestamp()}——${$("#username").text()}——${$("#chat-area")
          .val()
          .trim()}`
      });
    }
  });
});
