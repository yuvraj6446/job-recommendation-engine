const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");

let WEIGHTS = {
    skills: 50,
    experience: 20,
    location: 15,
    salary: 15
};

const normalizeSkill = (skill) => {
    return skill.trim().toLowerCase();
};

const calculateSkillScore = (candidate, job) => {
    const candidateSkills = new Set(
        candidate.skills.map(normalizeSkill)
    );

    const mustHaveSkills = job.requiredSkills.filter(
        (skill) => skill.type === "must-have"
    );

    const niceToHaveSkills = job.requiredSkills.filter(
        (skill) => skill.type === "nice-to-have"
    );

    // Hard filter
    const missingMustHave = mustHaveSkills.filter(
        (skill) => !candidateSkills.has(normalizeSkill(skill.name))
    );

    if (missingMustHave.length > 0) {
        return {
            eligible: false,
            score: 0,
            maxScore: WEIGHTS.skills,
            missingMustHave: missingMustHave.map(
                (skill) => skill.name
            )
        };
    }

    const matchedMustHave = mustHaveSkills.filter(
        (skill) => candidateSkills.has(normalizeSkill(skill.name))
    );

    const matchedNiceToHave = niceToHaveSkills.filter(
        (skill) => candidateSkills.has(normalizeSkill(skill.name))
    );

    let mustHaveScore = 0;
    let niceToHaveScore = 0;

    if (mustHaveSkills.length > 0) {
        mustHaveScore =
            (matchedMustHave.length / mustHaveSkills.length) *
            (WEIGHTS.skills * 0.8);
    }

    if (niceToHaveSkills.length > 0) {
        niceToHaveScore =
            (matchedNiceToHave.length / niceToHaveSkills.length) *
            (WEIGHTS.skills * 0.2);
    }

    // Redistribute unused skill weight
    if (mustHaveSkills.length === 0) {
        niceToHaveScore =
            niceToHaveSkills.length === 0
                ? WEIGHTS.skills
                : (matchedNiceToHave.length / niceToHaveSkills.length) *
                  WEIGHTS.skills;
    }

    if (niceToHaveSkills.length === 0 && mustHaveSkills.length > 0) {
        mustHaveScore = WEIGHTS.skills;
    }

    return {
        eligible: true,
        score: mustHaveScore + niceToHaveScore,
        maxScore: WEIGHTS.skills,
        matchedMustHave: matchedMustHave.map(
            (skill) => skill.name
        ),
        matchedNiceToHave: matchedNiceToHave.map(
            (skill) => skill.name
        )
    };
};

const calculateExperienceScore = (candidate, job) => {
    const candidateExperience = candidate.yearsOfExperience;
    const requiredExperience = job.minYearsExperience;

    if (requiredExperience === 0) {
        return {
            score: WEIGHTS.experience,
            maxScore: WEIGHTS.experience
        };
    }

    if (candidateExperience >= requiredExperience) {
        return {
            score: WEIGHTS.experience,
            maxScore: WEIGHTS.experience
        };
    }

    const score =
        (candidateExperience / requiredExperience) *
        WEIGHTS.experience;

    return {
        score: Math.max(0, score),
        maxScore: WEIGHTS.experience
    };
};

const calculateLocationScore = (candidate, job) => {
    const candidateLocation =
        candidate.location.trim().toLowerCase();

    const jobLocation =
        job.location.trim().toLowerCase();

    if (candidateLocation === jobLocation) {
        return {
            score: WEIGHTS.location,
            maxScore: WEIGHTS.location
        };
    }

    if (job.remoteAllowed) {
        return {
            score: WEIGHTS.location * (10 / 15),
            maxScore: WEIGHTS.location
        };
    }

    return {
        score: 0,
        maxScore: WEIGHTS.location
    };
};

const calculateSalaryScore = (candidate, job) => {
    const expectedSalary = candidate.expectedSalary;
    const minSalary = job.salaryRange.min;
    const maxSalary = job.salaryRange.max;

    // Job's maximum salary is below candidate's expectation
    if (maxSalary < expectedSalary) {
        return {
            score: 0,
            maxScore: WEIGHTS.salary
        };
    }

    // Candidate's expectation is inside the salary range
    if (
        expectedSalary >= minSalary &&
        expectedSalary <= maxSalary
    ) {
        const range = maxSalary - minSalary;

        // If min and max are equal
        if (range === 0) {
            return {
                score: WEIGHTS.salary,
                maxScore: WEIGHTS.salary
            };
        }

        const position =
            (expectedSalary - minSalary) / range;

        const score =
            WEIGHTS.salary * (2 / 3) +
            (1 - position) * (WEIGHTS.salary / 3);

        return {
            score,
            maxScore: WEIGHTS.salary
        };
    }

    // Job starts above candidate's expectation
    if (minSalary > expectedSalary) {
        return {
            score: WEIGHTS.salary,
            maxScore: WEIGHTS.salary
        };
    }

    return {
        score: 0,
        maxScore: WEIGHTS.salary
    };
};

const scoreJob = (candidate, job) => {
    const skillResult = calculateSkillScore(candidate, job);

    // Must-have skill missing
    if (!skillResult.eligible) {
        return {
            eligible: false,
            score: 0,
            breakdown: null,
            missingMustHave: skillResult.missingMustHave
        };
    }

    const experienceResult =
        calculateExperienceScore(candidate, job);

    const locationResult =
        calculateLocationScore(candidate, job);

    const salaryResult =
        calculateSalaryScore(candidate, job);

    const totalScore =
        skillResult.score +
        experienceResult.score +
        locationResult.score +
        salaryResult.score;

    return {
        eligible: true,

        score: Math.round(totalScore * 100) / 100,

        breakdown: {
            skills: {
                score: Math.round(skillResult.score * 100) / 100,
                maxScore: WEIGHTS.skills
            },

            experience: {
                score: Math.round(experienceResult.score * 100) / 100,
                maxScore: WEIGHTS.experience
            },

            location: {
                score: Math.round(locationResult.score * 100) / 100,
                maxScore: WEIGHTS.location
            },

            salary: {
                score: Math.round(salaryResult.score * 100) / 100,
                maxScore: WEIGHTS.salary
            }
        }
    };
};

const getJobRecommendations = async (req, res) => {
    try {
        const { candidateId } = req.params;

        let limit = parseInt(req.query.limit) || 10;

        if (limit < 1) {
            limit = 1;
        }

        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        const jobs = await Job.find();

        const recommendations = jobs
            .map((job) => {
                const result = scoreJob(candidate, job);

                return {
                    job,
                    ...result
                };
            })
            .filter((result) => result.eligible)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return res.status(200).json({
            success: true,
            candidate: {
                id: candidate._id,
                name: candidate.name
            },
            count: recommendations.length,
            recommendations
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate job recommendations",
            error: error.message
        });
    }
};

const getCandidateRecommendations = async (req, res) => {
    try {
        const { jobId } = req.params;

        let limit = parseInt(req.query.limit) || 10;

        if (limit < 1) {
            limit = 1;
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const candidates = await Candidate.find();

        const recommendations = candidates
            .map((candidate) => {
                const result = scoreJob(candidate, job);

                return {
                    candidate: {
                        id: candidate._id,
                        name: candidate.name
                    },
                    ...result
                };
            })
            .filter((result) => result.eligible)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return res.status(200).json({
            success: true,
            job: {
                id: job._id,
                title: job.title
            },
            count: recommendations.length,
            recommendations
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate candidate recommendations",
            error: error.message
        });
    }
};

// Update global scoring weights
const updateWeights = async (req, res) => {
    try {
        const {
            skills,
            experience,
            location,
            salary
        } = req.body;

        const newWeights = {
            skills: Number(skills),
            experience: Number(experience),
            location: Number(location),
            salary: Number(salary)
        };

        const values = Object.values(newWeights);

        // Check valid numbers
        if (
            values.some(
                (weight) => !Number.isFinite(weight)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "All weights must be valid numbers"
            });
        }

        // Check negative values
        if (
            values.some(
                (weight) => weight < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Weights cannot be negative"
            });
        }

        // Check total weight
        const totalWeight =
            newWeights.skills +
            newWeights.experience +
            newWeights.location +
            newWeights.salary;

        if (totalWeight !== 100) {
            return res.status(400).json({
                success: false,
                message: "Weights must add up to 100"
            });
        }

        // Update global weights
        WEIGHTS = newWeights;

        return res.status(200).json({
            success: true,
            message: "Global scoring weights updated successfully",
            weights: WEIGHTS
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update scoring weights",
            error: error.message
        });
    }
};

module.exports = {
    scoreJob,
    calculateSkillScore,
    calculateExperienceScore,
    calculateLocationScore,
    calculateSalaryScore,
    getJobRecommendations,
    getCandidateRecommendations,
    updateWeights
};