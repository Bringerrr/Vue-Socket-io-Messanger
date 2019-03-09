const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

// express stuff
const app = express();
app.use(bodyParser.json());
// const cors = require("cors");
// const server = require("http").Server(app);

// app.use(cors());

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
  // console.log("sockets online after connection : ", sockets);
  console.log("socket connected : " + socket.id);
  socket.on("joinRoom", async roomid => {
    socket.join(roomid);
    console.log(`socket ${socket.id} joined room ${roomid}`);
  });
  socket.on("message", async message_data => {
    // let _id = await chat.setMessage(message_data.text, message_data.name);
    // message_data._id = _id;
    console.log(message_data);
    socket.broadcast.emit("message", message_data);
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
      console.log(`socket ${socket.id} closed`);
    }
    console.log("Got disconnect!");

    const socketindex = sockets.indexOf(socket);
    sockets.splice(socketindex, 1);
    console.log("sockets online left: " + sockets);
  });

  socket.on("disconnect", () => {
    console.log("Got disconnect by default!");
    const socketindex = sockets.indexOf(socket);
    sockets.splice(socketindex, 1);
    console.log("sockets online left: " + sockets);
  });
});
