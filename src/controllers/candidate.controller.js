const createCandidate = require('../services/candidate.service');
const getCandidateById = require('../services/candidate.service');
const candidateService = require('../services/candidate.service');

const createCandidateController = async (req, res) => {
    try {
       
        const candidateData=req.body;
        console.log(candidateData);
        const candidate = await candidateService.createCandidate(candidateData);
        res.status(201).json({
           success: true,
           message: 'Candidate created successfully',
           data: candidate,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            
            message: error.message
        });
    }}

    module.exports = {
        createCandidateController,
    };