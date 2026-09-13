const express = require("express");

const jobScoreController = require("../controllers/jobScore.controller");

const router = express.Router();

router.get(
    "/candidates/:candidateId/recommendations",
    jobScoreController.getJobRecommendations
);

module.exports = router;