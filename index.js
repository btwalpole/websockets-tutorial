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

const state = {};
const sessions = {}; //allows us to look up room name of a given sessionID
/*
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  console.log("username", username);
  if (!username) {
    console.log("invalid username");
  }
  socket.sessionID = makeId(10);
  socket.userID = randomId(15);
  socket.username = username;
  next();
});
*/

io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  const username = socket.handshake.auth.username;
  console.log("username", username);
  if (!username) {
    console.log("invalid username");
  }
  socket.sessionID = makeId(10);
  socket.userID = makeId(15);
  socket.username = username;

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.on("buzz", function (data) {
    console.log("this person buzzed: ", data.name);
    console.log("they buzzed in this room ", data.roomName);
    console.log("admin of this room is: ", state[data.roomName].admin);
    io.to(data.roomName).emit("buzzed", {
      ...data,
      admin: state[data.roomName].admin,
    });
  });

  socket.on("reset", function (roomName) {
    io.in(roomName).emit("reset");
  });

  socket.on("newGame", function () {
    console.log("starting new game");
    const roomName = makeId(5);
    sessions[socket.sessionID] = {
      room: roomName,
      userID: socket.userID,
      username: socket.username,
    };

    //define state of room, set admin as first user
    state[roomName] = { admin: socket.userID, users: [socket.username] };

    socket.join(roomName);
    socket.emit("initQuiz", { admin: state[roomName].admin });

    //send roomName back to user for display, handle this on front end
    socket.emit("showGameCode", roomName);
    console.log("players: ", state[roomName].users);
    io.in(roomName).emit("updatePlayerList", state[roomName].users);
  });

  socket.on("joinGame", function ({ userName, roomName }) {
    if (state[roomName]) {
      console.log("room " + roomName + " does exist");
      //first need to check if a player already exists with this name in this room
      if (state[roomName].users.includes(userName)) {
        console.log("this name is taken");
        //if username taken then send message back to user saying this
        socket.emit("userNameTaken", userName);
      } else {
        console.log("name is not taken");
        //if name not taken, join the room:
        sessions[socket.sessionID] = {
          room: roomName,
          userID: socket.userID,
          username: socket.username,
        };
        state[roomName].users.push(userName);

        console.log("now joining ", roomName);
        socket.join(roomName);

        console.log("user: " + userName + " is joining room " + roomName);
        console.log("admin of this room is: ", state[roomName].admin);

        socket.emit("initQuiz", {
          name: userName,
          admin: state[roomName].admin,
        });
        socket.emit("showGameCode", roomName);

        io.to(roomName).emit("updatePlayerList", state[roomName].users);
      }
    } else {
      console.log("room " + roomName + " does NOT exist");
      socket.emit("noSuchRoom", roomName);
    }
  });
});

function makeId(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
