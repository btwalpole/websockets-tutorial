const express = require("express");
const socket = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function () {
  console.log("listening to requests on port 3000");
});

// Serve Static files
app.use(express.static("public"));

//Socket setup
const io = socket(server);

const state = {}
const clientRooms = {} //allows us to look up room name of a given userId

io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  socket.on("chat", function (data) {
    io.sockets.emit("chat", data);
  });

  socket.on("reset", function () {
    io.sockets.emit("reset");
  });
});


io.on("newGame", function(socket) {
  //join current sockiet to a room
  let roomName = '5HU76T'//makeId
  clientRooms[socket.id] = roomName;

  //send roomName back to user for display, handle this on front end
  client.emit('gameCode', roomName);

  //define state of room, set admin as first user
  state[roomName] = {'admin': socket.id}

  client.join(roomName);
  client.number = 1;
  client.emit('initQuiz', 1);
})
