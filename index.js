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
    io.sockets.in(data.roomName).emit("chat", data);
  });

  socket.on("reset", function (roomName) {
    io.sockets.in(roomName).emit("reset");
  });
  
  socket.on("newGame", function(userName) {
    let roomName = makeid(5);
    clientRooms[socket.id] = roomName;

    //send roomName back to user for display, handle this on front end
    socket.emit('gameCode', roomName);

    //define state of room, set admin as first user
    state[roomName] = {'admin': socket.id}

    socket.join(roomName);
    socket.number = 1;
    socket.emit('initQuiz', userName);
  })

  socket.on("joinGame", function(data) {
    const room = io.sockets.adapter.rooms[data.roomName];

    let allUsers;
    //check there is actually a room with this game code
    if (room) {
       //gives a object where key is socket id and value is socket object
      allUsers = room.sockets;
    }

    let numClients = 0;
    //check there is someone in the room already
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      socket.emit('unknownCode');
      return;
    }

    clientRooms[client.id] = data.roomName;
    socket.join(data.roomName);
    socket.emit('initQuiz', data.userName);
    //add to list of players in the room?
  })

});

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}