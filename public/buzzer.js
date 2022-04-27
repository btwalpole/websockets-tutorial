//Initialise socket
const socket = io({
  autoConnect: false,
  auth: {},
});

//on page load, check localstorage for session id
//if none, then we connect later on joining/ crating a game
const sessionID = localStorage.getItem("sessionID");
if (sessionID) {
  console.log("found a session id: ", sessionID);
  socket.auth.sessionID = sessionID;
  socket.connect();
} else {
  console.log('no previous session id found')
}

//Query DOM
var resetBtn = document.getElementById("reset"),
  userName = document.getElementById("userName"),
  buzzBack = document.getElementsByClassName("buzzBack"),
  buzzFront = document.getElementsByClassName("buzzFront"),
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
  socket.auth.username = userName.value;

  homeUserName.innerText = userName.value;
});

newGameBtn.addEventListener("click", function () {
  console.log("now creating game as ", userName.value);
  //socket.auth.username = userName.value;
  console.log("socket", socket);
  console.log("now connecting to socket.io");
  socket.connect();
  console.log("now emitting newGame event");
  socket.emit("newGame");
});

joinGameBtn.addEventListener("click", function () {
  if (gameCode.value != "") {
    //socket.auth.username = userName.value;
    console.log("socket", socket);
    console.log("now connecting to socket.io");
    socket.connect();
    console.log("joining room: ", gameCode.value);
    socket.emit("joinGame", { roomName: gameCode.value});
  } else {
    console.log("game code field is empty");
  }
});

socket.on("clearLocalStorage", () => {
  console.log("clearing localStorage");
  localStorage.removeItem("sessionID");
  socket.auth  = {}
  socket.disconnect();
});

socket.on("newSession", ({ sessionID, userID }) => {
  // attach the session ID to the socket for the next reconnection attempts
  socket.auth = { sessionID };
  localStorage.setItem("sessionID", sessionID);
  socket.userID = userID;
  console.log("got new session event");
});

socket.on("oldSession", ({ userID, roomName, oldUserName }) => {
  socket.userID = userID;
  socket.roomName = roomName;
  userName.value = oldUserName;
  console.log("got old session event");
  socket.emit("joinGame", { roomName: socket.roomName, reJoin: true });
});

socket.on("initQuiz", function (data) {
  //hide the home screen a show the game screen
  homeScreen.style.display = "none";
  gameScreen.style.display = "flex";
  enterNameScreen.style.display = "none";
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
  disableBuzzer();
  output.innerHTML =
    "<p id='nameText'>" +
    data.name +
    "</p><p>   buzzed first!!</p><p id='emoji'> " +
    emojis[data.emojiNum] +
    " </p>";
});

socket.on("reset", function () {
  enableBuzzer();
});

socket.on("buzzerState", function ({buzzerEnabled}) {
  console.log("buzzerEnabled: ", buzzerEnabled);
  if(buzzerEnabled) {
    enableBuzzer();
    console.log('enabling buzzer')
  } else {
    disableBuzzer();
    console.log('disabling buzzer')
  }
});

function enableBuzzer() {
  buzzBack[0].disabled = false;
  buzzBack[0].classList.add("enabled-buzzBack");
  buzzBack[0].classList.remove("disabled-buzzBack");
  buzzFront[0].classList.add("enabled-buzzFront");
  buzzFront[0].classList.remove("disabled-buzzFront");
  resetBtn.disabled = true;
  resetBtn.classList.remove("enabled-reset");
  resetBtn.classList.add("disabled-reset");
}

function disableBuzzer() {
  buzzBack[0].disabled = true;
  buzzBack[0].classList.add("disabled-buzzBack");
  buzzBack[0].classList.remove("enabled-buzzBack");
  buzzFront[0].classList.add("disabled-buzzFront");
  buzzFront[0].classList.remove("enabled-buzzFront");
  resetBtn.disabled = false;
  resetBtn.classList.add("enabled-reset");
  resetBtn.classList.remove("disabled-reset");
}

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
