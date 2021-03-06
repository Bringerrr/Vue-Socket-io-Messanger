const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

// express stuff
const app = express();
app.use(bodyParser.json());

// graphQL stuff
const graphqlHttp = require("express-graphql");
const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");

// Close down CORS policy

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

// Import Environment Variables and Mongoose Models
require("dotenv").config({ path: ".env" });

// Connect to MLab Database
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongo DB connected");
  })
  .catch(err => {
    console.log(err);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

const io = require("socket.io")(server);
const sockets = [];
io.on("connection", function(socket) {
  sockets.push(socket);
  socket.on("joinRoom", async payload => {
    const { roomId } = payload;
    socket.join(roomId, () => {
      console.log(payload.username + " joined the room " + roomId);
      io.to(roomId).emit(`a new user has joined the room ${roomId}`);
    });
  });
  socket.on("leaveRoom", async payload => {
    const { roomId } = payload;
    socket.leave(roomId, () => {
      console.log(payload.username + " left the room " + roomId);
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
