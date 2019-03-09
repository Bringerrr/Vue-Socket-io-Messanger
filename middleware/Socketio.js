const server = require('../App')
const io = require("socket.io")(server);

io.on("connection", function(socket) {
  console.log("User connected");
  socket.on("message", async (message_data) => {
    console.log('data', message_data)
    let _id = await chat.setMessage(message_data.text, message_data.name);
    message_data._id = _id;
    socket.broadcast.emit("message", (message_data));
  });

  socket.on("editMessage", async (message_data) => {
    let check = false;
    check = await chat.editMessage(message_data.text, message_data._id, message_data.index);
    console.log('CHECK',check)
    if (check === message_data.index) {
      socket.broadcast.emit("editMessage", message_data);
    } else {
      console.log('Smth wrong with editing');
    }
  });

  socket.on("resetMessage", async (message_data) => {
    let check = false;
    console.log('messID', message_data)
    check = await chat.resetMessage(message_data._id, message_data.index);
    console.log('CHECK',check)
    if (check === message_data.index) {
      socket.broadcast.emit("resetMessage", message_data.index);
    } else {
      console.log('Smth wrong with deliting')
    }
  });

  socket.on("disconnect", () => {
    console.log('disconnect')
  })
});

module.exports = server;
  