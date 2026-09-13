const jobService = require("../services/job.service");

const createJob = async (req, res) => {
    try {
        const job = await jobService.createJob(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createJob
};