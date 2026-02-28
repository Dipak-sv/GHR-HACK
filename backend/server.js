require("dotenv").config();

const app = require("./src/app");
const mongoose=require("mongoose");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;


connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});