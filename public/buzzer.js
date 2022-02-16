//Make connection
//const socket = io.connect('http://localhost:4000');
const socket = io();

//Query DOM
var resetBtn = document.getElementById("reset"),
  userName = document.getElementById("name"),
  btn = document.getElementById("buzz"),
  output = document.getElementById("output");

// Emit events

function playSound() {
  const audio = document.getElementById("audio");
  if (!audio) return;
  audio.currentTime = 0;
  audio.play();
}

btn.addEventListener("click", function () {
  socket.emit("chat", {
    name: userName.value,
  });

  playSound();
});

resetBtn.addEventListener("click", function () {
  socket.emit("reset");
});

//Listen for events
socket.on("chat", function (data) {
  const random = Math.floor(Math.random() * emojis.length);
  output.innerHTML +=
    "<p><strong>" +
    data.name +
    " </strong> buzzed first!! " +
    emojis[random] +
    " </p>";
  btn.disabled = true;
  btn.classList.add("disabled-btn");
});

socket.on("reset", function () {
  btn.disabled = false;
  btn.classList.remove("disabled-btn");
});

const emojis = [
  "&#128512;",
  "&#128526;",
  "&#128519;",
  "&#128587;&#127998;",
  "&#128591;&#127998;",
  "&#128680;",
  "&#128718;",
  "&#129310;",
  "&#129305;&#127996;",
  "&#129322;",
  "&#129335;",
  "&#129351;",
  "&#129365;",
  "&#129419;",
  "&#129425;",
  "&#129428;",
  "&#129504;",
  "&#128170;&#127996;",
  "&#;",
  "&#;",
  "&#;",
  "&#;",
  "&#;",
];
