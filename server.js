const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = { users: [], turn: 0 };
    }

    rooms[room].users.push({ id: socket.id, name: username });

    io.to(room).emit("room_users", rooms[room].users);
    io.to(room).emit("turn_update", rooms[room].users[rooms[room].turn].name);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", ({ room, user }) => {
    socket.to(room).emit("show_typing", user);
  });

  socket.on("stop_typing", ({ room }) => {
    socket.to(room).emit("hide_typing");
  });

  socket.on("next_turn", (room) => {
    let r = rooms[room];
    if (!r) return;

    r.turn = (r.turn + 1) % r.users.length;
    io.to(room).emit("turn_update", r.users[r.turn].name);
  });

});

server.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});

