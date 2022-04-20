//Make connection
const socket = io({
  autoConnect: false,
  auth: {
    token: "abcd",
  },
});

//on page load, check localstorage for session id
//if none, then we set the session id
/*
const sessionID = localStorage.getItem("sessionID");
if (!sessionID) {
  socket.auth.sessionID = "686886868";
}
*/
//Query DOM
var resetBtn = document.getElementById("reset"),
  userName = document.getElementById("userName"),
  buzzBack = document.getElementsByClassName("buzzBack"),
  buzzFront = document.getElementsByClassName("buzzFront"),
  chat = document.getElementById("chat-window"),
  output = document.getElementById("output"),
  homeScreen = document.getElementById("homeScreen"),
  homeUserName = document.getElementById("homeUserName"),
  gameScreen = document.getElementById("gameScreen"),
  enterNameScreen = document.getElementById("enterNameScreen"),
  roomNameCreate = document.getElementById("roomNameCreate"),
  newGameBtn = document.getElementById("newGameButton"),
  joinGameBtn = document.getElementById("joinGameBtn"),
  submitNameBtn = document.getElementById("submitNameBtn"),
  gameCodeDisplay = document.getElementById("gameCodeDisplay"),
  gameCode = document.getElementById("gameCode"),
  nameDisplay = document.getElementById("name"),
  playersDisplay = document.getElementById("players");

//// Setting up the game
submitNameBtn.addEventListener("click", function () {
  homeScreen.style.display = "flex";
  enterNameScreen.style.display = "none";

  console.log("name: ", userName.value);
  homeUserName.innerText = userName.value;
});

newGameBtn.addEventListener("click", function () {
  console.log("now creating game as ", userName.value);
  socket.auth.username = userName.value;
  console.log("socket", socket);
  console.log("now connecting to socket.io");
  socket.connect();
  console.log("now emitting newGame event");
  socket.emit("newGame");
});

joinGameBtn.addEventListener("click", function () {
  if (gameCode.value != "") {
    socket.auth.username = userName.value;
    console.log("socket", socket);
    console.log("now connecting to socket.io");
    socket.connect();
    console.log("joining room: ", gameCode.value);
    socket.emit("joinGame", gameCode.value);
  } else {
    console.log("game code field is empty");
  }
});

socket.on("session", ({ sessionID, userID }) => {
  // attach the session ID to the next reconnection attempts
  socket.auth = { sessionID };
  // store it in the localStorage
  localStorage.setItem("sessionID", sessionID);
  // save the ID of the user
  socket.userID = userID;
  console.log("got session event, now socket is: ", socket);
});

socket.on("initQuiz", function (data) {
  //hide the home screen a show the game screen
  homeScreen.style.display = "none";
  gameScreen.style.display = "flex";
  nameDisplay.innerText = userName.value;
  if (socket.userID === data.admin) {
    resetBtn.style.display = "flex";
  }
});

socket.on("noSuchRoom", (roomName) => {
  console.log("entered room " + roomName + " does not exist");
  let errorMsg = document.createElement("p");
  errorMsg.setAttribute("id", "errorMsg");
  errorMsg.innerHTML = "No such room exists!";
  gameCode.after(errorMsg);
});

socket.on("userNameTaken", (takenName) => {
  console.log("user name " + takenName + " is already taken!");
  let nameTakenErrMsg = document.createElement("p");
  nameTakenErrMsg.setAttribute("id", "nameTakenErrMsg");
  nameTakenErrMsg.innerHTML = "User name already taken!";
  userNameJoin.after(nameTakenErrMsg);
});

//Below is for once you've joined a game

socket.on("showGameCode", function (roomName) {
  console.log("showing the game code: ", roomName);
  gameCodeDisplay.innerText = roomName;
});

socket.on("updatePlayerList", function (players) {
  console.log("recieved new players list: ", players);
  playersDisplay.replaceChildren();
  players.forEach((playerName) => {
    let li = document.createElement("li");
    playersDisplay.append(li);
    li.innerText = playerName;
  });
});

//// Using the buzzer

// Emit events
buzzBack[0].addEventListener("click", function () {
  const random = Math.floor(Math.random() * emojis.length);

  socket.emit("buzz", {
    name: nameDisplay.innerText,
    emojiNum: random,
    roomName: gameCodeDisplay.innerText,
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
socket.on("buzzed", function (data) {
  console.log("current socket id: ", socket.userID);
  console.log("admin socket id: ", data.admin);

  if (socket.userID === data.admin) {
    console.log("you are the admin!");
    resetBtn.disabled = false;
    resetBtn.classList.add("enabled-reset");
    resetBtn.classList.remove("disabled-reset");
  }

  output.innerHTML =
    "<p id='nameText'>" +
    data.name +
    "</p><p>   buzzed first!!</p><p id='emoji'> " +
    emojis[data.emojiNum] +
    " </p>";
  buzzBack[0].disabled = true;
  buzzBack[0].classList.add("disabled-buzzBack");
  buzzBack[0].classList.remove("enabled-buzzBack");
  buzzFront[0].classList.add("disabled-buzzFront");
  buzzFront[0].classList.remove("enabled-buzzFront");
  //chat.scrollTop = chat.scrollHeight;
});

socket.on("reset", function () {
  //these changes are only visible to the admin user, button is invisble to all others
  buzzBack[0].disabled = false;
  buzzBack[0].classList.add("enabled-buzzBack");
  buzzBack[0].classList.remove("disabled-buzzBack");
  buzzFront[0].classList.add("enabled-buzzFront");
  buzzFront[0].classList.remove("disabled-buzzFront");
  resetBtn.disabled = true;
  resetBtn.classList.remove("enabled-reset");
  resetBtn.classList.add("disabled-reset");
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
