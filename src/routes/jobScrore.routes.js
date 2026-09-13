const express = require("express");

const jobScoreController = require("../controllers/jobScore.controller");

const router = express.Router();

router.get(
    "/candidates/:candidateId/recommendations",
    jobScoreController.getJobRecommendations
);
router.get(
    "/jobs/:jobId/recommendations",
    jobScoreController.getCandidateRecommendations
);
router.post(
    "/weights",
    jobScoreController.updateWeights
);

module.exports = router;