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

io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  const sessionID = socket.handshake.auth.sessionID;
  console.log("sessionID: ", sessionID);

  if (sessionID) {
    // check if there is an associated room and userid and username for this session
    if (sessions[sessionID]) {
      // setting values on the socket instance
      socket.sessionID = sessionID;
      socket.userID = sessions[sessionID].userID;
      socket.username = sessions[sessionID].username;
      console.log("found session details: ", sessions[sessionID]);

      socket.emit("oldSession", {
        userID: socket.userID,
        roomName: sessions[sessionID].room,
        oldUserName: socket.username,
      });
    } else {
      console.log(
        "found sessionID in localStorage " +
          sessionID +
          " but no session in server!"
      );
      console.log(
        "telling client to remove session from storage and reconnect"
      );
      socket.emit("clearLocalStorage");
    }
  } else {
    //no session ID saved in localStorage - send ID to be set
    const username = socket.handshake.auth.username;
    console.log("username", username);
    if (!username) {
      console.log("invalid or no username");
    }
    socket.sessionID = makeId(10);
    console.log("freshly created sessionID: ", socket.sessionID);
    socket.userID = makeId(15);
    socket.username = username;

    socket.emit("newSession", {
      sessionID: socket.sessionID,
      userID: socket.userID,
    });
  }

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

  socket.on("joinGame", function ({ roomName, reJoin }) {
    if (state[roomName]) {
      console.log("room " + roomName + " does exist");
      //first need to check if a player already exists with this name in this room
      if (reJoin === false && state[roomName].users.includes(socket.username)) {
        socket.emit("userNameTaken", socket.username);
      } else {
        console.log("name is not taken");
        //if name not taken, join the room:
        sessions[socket.sessionID] = {
          room: roomName,
          userID: socket.userID,
          username: socket.username,
        };

        //in here we are rejoining (so we have previously disconnected), or the name is not present already, so should be no duplication
        state[roomName].users.push(socket.username);

        console.log("now joining ", roomName);
        socket.join(roomName);

        console.log(
          "user: " + socket.username + " is joining room " + roomName
        );
        console.log("admin of this room is: ", state[roomName].admin);

        socket.emit("initQuiz", {
          name: socket.username,
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

  socket.on("disconnect", () => {
    console.log(socket.id);
    //check if user is in a room
    console.log('socket.sessionID', socket.sessionID)
    console.log('sessions[socket.sessionID]', sessions[socket.sessionID])

    if (socket.hasOwnProperty('sessionID')) {
      if (sessions[socket.sessionID].hasOwnProperty('room')) {
        const room = sessions[socket.sessionID].room;
        //remove user from room state
        //remove username from state[roomName].users
        console.log('removing ' + socket.username + 'from room: ' + room)
        const i = state[room].users.indexOf(socket.username);
        state[room].users.splice(i, 1);
        io.in(room).emit("updatePlayerList", state[room].users);
      } else {
        console.log('no room found to remove the user from')
      }
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
