const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});


const uploadRoutes = require("./routes/upload.route");
const prescriptionRoutes = require("./routes/prescription.route");
const simplifyRoutes = require("./routes/simplify.route");
const confirmRoutes = require("./routes/confirm.route");

app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/simplify", simplifyRoutes);
app.use("/api/confirm", confirmRoutes);

module.exports = app;