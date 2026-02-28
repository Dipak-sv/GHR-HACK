const express = require("express");
const router = express.Router();
const { simplifyText } = require("../controllers/simplify.controller");

router.post("/", simplifyText);

module.exports = router;