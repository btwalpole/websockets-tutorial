//Make connection
//const socket = io.connect('http://localhost:4000');
const socket = io();

//Query DOM
var resetBtn = document.getElementById("reset"),
  userName = document.getElementById("name"),
  buzzBtn = document.getElementById("buzz"),
  chat = document.getElementById("chat-window"),
  output = document.getElementById("output");

// Emit events
buzzBtn.addEventListener("click", function () {
  const random = Math.floor(Math.random() * emojis.length);

  socket.emit("chat", {
    name: userName.value,
    emojiNum: random,
  });

  const video = document.querySelector("video");

  video.hidden = false;
  video.play();

  video.addEventListener("ended", (event) => {
    video.hidden = true;
  });
});

resetBtn.addEventListener("click", function () {
  socket.emit("reset");
});

//Listen for events
  socket.on("chat", function (data) {
    output.innerHTML =
      "<p><strong>" +
      data.name +
      " </strong> buzzed first!! " +
      emojis[data.emojiNum] +
      " </p>";
    buzzBtn.disabled = true;
    buzzBtn.classList.add("disabled-buzz");
    buzzBtn.classList.remove("enabled-buzz");
    console.log("userName: ", userName.value);

    if (userName.value === "bilboJenkins") {
      console.log("admin userName: ", userName.value);
      resetBtn.disabled = false;
      resetBtn.classList.add("enabled-reset");
      resetBtn.classList.remove("disabled-reset");
    }
    //chat.scrollTop = chat.scrollHeight;
  });

  socket.on("reset", function () {
    buzzBtn.disabled = false;
    buzzBtn.classList.remove("disabled-buzz");
    buzzBtn.classList.add("enabled-buzz");
    if (userName.value === "bilboJenkins") {
      resetBtn.disabled = true;
      resetBtn.classList.remove("enabled-reset");
      resetBtn.classList.add("disabled-reset");
    }
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
  "&#11088;",
  "&#127752;",
  "&#127790;",
  "&#127803;",
  "&#127850;",
];
