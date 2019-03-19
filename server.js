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

module.exports = app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});
