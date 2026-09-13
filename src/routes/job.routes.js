const express = require("express");

const jobController = require("../controllers/job.controller");

const router = express.Router();

router.post("/createJob", jobController.createJob);

module.exports = router;