// const Job = require("../models/Job");
const Job = require("../models/job.model");

const createJob = async (jobData) => {
    const job = await Job.create(jobData);

    return job;
};

const getJobById = async (jobId) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error("Job not found");
    }

    return job;
};

const getAllJobs = async () => {
    const jobs = await Job.find();

    return jobs;
};

module.exports = {
    createJob,
    getJobById,
    getAllJobs
};