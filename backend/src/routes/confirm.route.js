const express = require("express");
const router = express.Router();
const { confirmPrescription } = require("../controllers/confirm.controller");

router.post("/:id", confirmPrescription);

module.exports = router;