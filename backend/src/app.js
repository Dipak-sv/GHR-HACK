const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

module.exports = app;