//Make connection
//const socket = io.connect('http://localhost:4000');
const socket = io();

//Query DOM
var resetBtn = document.getElementById("reset"),
  userName = document.getElementById("userName"),
  buzzBtn = document.getElementById("buzz"),
  chat = document.getElementById("chat-window"),
  output = document.getElementById("output"),
  initScreen = document.getElementById("initialScreen"),
  gameScreen = document.getElementById("gameScreen"),
  newGameBtn = document.getElementById("newGameButton"),
  joinGameBtn = document.getElementById("joinGameButton"),
  gameCodeDisplay = document.getElementById("gameCodeDisplay"),
  gameCode = document.getElementById("gameCode"),
  nameDisplay = document.getElementById("name");

//For the start screen

newGameBtn.addEventListener("click", function() {
  socket.emit('newGame', userName.value);
})

joinGameBtn.addEventListener("click", function() {
  socket.emit('joinGame', {
    roomName: gameCode.value,
    userName: userName.value
  });
})

function clear() {
  gameCodeInput.value = '';
  initScreen.style.display = "block";
  gameScreen.style.display = "none";
}

//Below is for once you've joined a game

socket.on('gameCode', function(gameCode) {
  gameCodeDisplay.innerText = gameCode;
})

socket.on('initQuiz', function(name) {
  //hide the intro screen a show the game screen
  initScreen.style.display = "none";
  gameScreen.style.display = "block";
  nameDisplay.innerHTML = name;
})

// Emit events
buzzBtn.addEventListener("click", function () {
  const random = Math.floor(Math.random() * emojis.length);

  socket.emit("chat", {
    name: userName.value,
    emojiNum: random,
    roomName: gameCodeDisplay.innerText
  });

  const video = document.querySelector("video");

  video.hidden = false;
  video.play();

  video.addEventListener("ended", (event) => {
    video.hidden = true;
  });
});

resetBtn.addEventListener("click", function () {
  socket.emit("reset", gameCodeDisplay.innerText);
});

//Listen for events
  socket.on("chat", function (data) {
    output.innerHTML =
      "<p id='nameText'>" +
      data.name +
      "</p><p> buzzed first!!</p><p id='emoji'> " +
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
