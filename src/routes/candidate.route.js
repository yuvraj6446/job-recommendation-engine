const express=require('express');
const router=express.Router();
const {createCandidateController}=require('../controllers/candidate.controller');

router.post('/createCandidate', createCandidateController);

module.exports = router;
