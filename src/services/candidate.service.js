const Candidate = require('../models/candidate.model');

const createCandidate=async(candidateData)=>{
   
    const candidate = await Candidate.create(candidateData);
    return candidate;
}


const getCandidateById=async(id)=>{
    const candidate=await Candidate.findOne({id:id});
    if(!candidate)
    {
        throw new Error(`Candidate with id ${id} not found`);
    }
    return candidate;
};

module.exports={
    createCandidate,
    getCandidateById,
}