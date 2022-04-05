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
const clientRooms = {}; //allows us to look up room name of a given userId

io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  socket.on("buzz", function (data) {
    console.log('this person buzzed: ', data.name)
    console.log("they buzzed in this room ", data.roomName);
    console.log('admin of this room is: ', state[data.roomName].admin)
    io.to(data.roomName).emit("buzzed", {...data, admin: state[data.roomName].admin});
  });

  socket.on("reset", function (roomName) {
    io.in(roomName).emit("reset");
  });

  socket.on("promptUsername", () => {
    console.log("prompting user to enter name")
    let roomName = makeid(5);
    socket.emit('displayEnterNameScreen', roomName);
  })

  socket.on("newGame", function ({userName, roomName}) {
    console.log("starting new game");
    clientRooms[socket.id] = roomName;

    //define state of room, set admin as first user
    state[roomName] = { admin: socket.id };

    socket.join(roomName);
    socket.number = 1;
    socket.emit("initQuiz", {name: userName, admin: state[roomName].admin});
    //send roomName back to user for display, handle this on front end
    socket.emit("showGameCode", roomName);
  });

  socket.on("searchGame", function(roomName) {
    console.log("trying to join room ", roomName);
    //CHECK THE ROOM EXISTS AND IS VALID, IF NOT THROW ERROR AND RETURN TO INITIAL SCREEN
    /*
    const room = io.sockets.adapter.rooms[data.roomName];
    console.log("room: ", room);

    let allUsers;
    //check there is actually a room with this game code
    if (room) {
      //gives a object where key is socket id and value is socket object
      allUsers = room.sockets;
      console.log("there is indeed a room called ", data.roomName);
    }

    let numClients = 0;
    //check there is someone in the room already
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      socket.emit("unknownCode");
      return;
    }

    console.log("someone is in the room already");
    */
   //IF ROOM IS VALID, GO TO ENTER NAME SCREEN
   socket.emit("displayEnterNameScreen-Join", roomName);
  });

  socket.on("joinGame", function ({userName, roomName}) {
    
    clientRooms[socket.id] = roomName;
    console.log("now joining ", roomName);
    socket.join(roomName);
    console.log('user: ' + userName + ' is joining room ' + roomName)
    console.log('admin of this room is: ', state[roomName].admin)
    socket.emit("initQuiz", {name: userName, admin: state[roomName].admin});
    socket.emit("showGameCode", roomName);
    //add to list of players in the room?
  });
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
