//Make connection
//const socket = io.connect('http://localhost:4000');
const socket = io();

//Query DOM
var message = document.getElementById("message"),
  name = document.getElementById("name"),
  btn = document.getElementById("buzz"),
  output = document.getElementById("output"),
  feedback = document.getElementById("feedback");

// Emit events
btn.addEventListener("click", function () {
  socket.emit("chat", {
    message: message.value,
    name: name.value,
  });
});

message.addEventListener("keypress", function () {
  socket.emit("typing", name.value);
});

//Listen for events
socket.on("chat", function (data) {
  feedback.innerHTML = "";
  output.innerHTML +=
    "<p><strong>" + data.name + ": </strong>" + data.message + "</p>";
});

socket.on("typing", function (data) {
  feedback.innerHTML =
    "<p><em>" + data + "is typing a message..." + "</em></p>";
});
