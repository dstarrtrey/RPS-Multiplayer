$(document).ready(function() {
  const timestamp = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return `${month}/${day}/${year} at ${hour}:${minute}`;
  };
  $(document).on("submit", "#my-chat", function(event) {
    event.preventDefault();
    if (
      $("#chat-area")
        .val()
        .trim().length > 0
    ) {
      database.ref("/chatLog").push({
        message: `${timestamp()}——${$("#username").val()}——${$("#chat-area")
          .val()
          .trim()}`
      });
    }
  });
});
