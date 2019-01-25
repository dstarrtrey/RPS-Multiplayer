$(document).ready(function() {
  const RPS = (user1RPS, user2RPS) => {
    if (user1RPS === user2RPS) {
      return "tie";
    } else if (
      (user1RPS === "Rock" && user2RPS === "Scissors") ||
      (user1RPS === "Paper" && user2RPS === "Rock") ||
      (user1RPS === "Scissors" && user2RPS === "Paper")
    ) {
      return "user1";
    } else if (
      (user2RPS === "Rock" && user1RPS === "Scissors") ||
      (user2RPS === "Paper" && user1RPS === "Rock") ||
      (user2RPS === "Scissors" && user1RPS === "Paper")
    ) {
      return "user2";
    } else {
      return "input error";
    }
  };
  const chat = message => {
    //append message to html for both users
  };
  if (localStorage.getItem("myUser")) {
    $("#name").remove();
    $("#user-info").append(
      $("<h3>").text(`User: ${localStorage.getItem("myUser")}`),
      $("<button>")
        .val("Change User")
        .attr("id", "change-user")
        .text("Change User")
    );
  }
  $(document).on("click", "#change-user", function() {
    $("#user-info").empty();
    const usernameForm = $("<form>").attr("id", "name");
    const user = $("<input>")
      .attr("type", "text")
      .attr("placeholder", "Enter Username")
      .attr("id", "username");
    const submitUser = $("<input>")
      .attr("type", "submit")
      .val("Submit");
    usernameForm.append(user, submitUser);
    $("#user-info").append(usernameForm);
  });
  $(document).on("submit", "#name", function(event) {
    event.preventDefault();
    localStorage.setItem("myUser", $("#username").val());
    $("#name").remove();
    $("#user-info").append(
      $("<h3>").text(`User: ${localStorage.getItem("myUser")}`),
      $("<button>")
        .val("Change User")
        .attr("id", "change-user")
        .text("Change User")
    );
  });
});
