const express = require("express");
const logger = require("morgan");
const firebaseRouter = require("./src/firebase");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/firebase", firebaseRouter);

module.exports = app;
