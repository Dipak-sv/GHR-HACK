const express = require("express");
const router = express.Router();
const { getPrescription } = require("../controllers/prescription.controller");

router.get("/:id", getPrescription);

module.exports = router;