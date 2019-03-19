const server = require("../server");

const io = require("socket.io")(server);
const sockets = [];
io.on("connection", function(socket) {
  sockets.push(socket);
  socket.on("joinRoom", async payload => {
    const { roomId } = payload;
    socket.join(roomId, () => {
      io.to(roomId).emit(`a new user has joined the room ${roomId}`);
    });
  });
  socket.on("leaveRoom", async payload => {
    const { roomId } = payload;
    socket.leave(roomId, () => {
      io.to(roomId).emit(`a user has left the room ${roomId}`);
    });
  });
  socket.on("message", async data => {
    socket.broadcast.to(data.roomId).emit("getMessage", data);
  });

  socket.on("editMessage", async message_data => {
    let check = false;
    check = await chat.editMessage(
      message_data.text,
      message_data._id,
      message_data.index
    );
    if (check === message_data.index) {
      socket.broadcast.emit("editMessage", message_data);
    } else {
    }
  });

  socket.on("resetMessage", async message_data => {
    let check = false;
    check = await chat.resetMessage(message_data._id, message_data.index);
    if (check === message_data.index) {
      socket.broadcast.emit("resetMessage", message_data.index);
    } else {
    }
  });

  socket.on("disconnectRoom", reason => {
    if (reason === "user exited the room") {
      socket.disconnect();
    }

    const socketindex = sockets.indexOf(socket);
    sockets.splice(socketindex, 1);
  });

  socket.on("disconnect", () => {
    const socketindex = sockets.indexOf(socket);
    sockets.splice(socketindex, 1);
  });
});
