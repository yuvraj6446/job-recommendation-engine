
const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");








const WEIGHTS = {
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
        (matchedMustHave.length / mustHaveSkills.length) * 40;
}

if (niceToHaveSkills.length > 0) {
    niceToHaveScore =
        (matchedNiceToHave.length / niceToHaveSkills.length) * 10;
}

// Redistribute unused skill weight
if (mustHaveSkills.length === 0) {
    niceToHaveScore =
        niceToHaveSkills.length === 0
            ? 50
            : (matchedNiceToHave.length / niceToHaveSkills.length) * 50;
}

if (niceToHaveSkills.length === 0 && mustHaveSkills.length > 0) {
    mustHaveScore = 50;
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
            score: 15,
            maxScore: 15
        };
    }

    if (job.remoteAllowed) {
        return {
            score: 10,
            maxScore: 15
        };
    }

    return {
        score: 0,
        maxScore: 15
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
            maxScore: 15
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
                score: 15,
                maxScore: 15
            };
        }

        // The closer the expectation is to the lower end,
        // the better the salary fit.
        const position =
            (expectedSalary - minSalary) / range;

        const score =
            10 + (1 - position) * 5;

        return {
            score,
            maxScore: 15
        };
    }

    // Job starts above candidate's expectation.
    // This is a very good salary match.
    if (minSalary > expectedSalary) {
        return {
            score: 15,
            maxScore: 15
        };
    }

    return {
        score: 0,
        maxScore: 15
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
                maxScore: 50
            },

            experience: {
                score: Math.round(experienceResult.score * 100) / 100,
                maxScore: 20
            },

            location: {
                score: locationResult.score,
                maxScore: 15
            },

            salary: {
                score: Math.round(salaryResult.score * 100) / 100,
                maxScore: 15
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

module.exports = {
    scoreJob,
    calculateSkillScore,
    calculateExperienceScore,
    calculateLocationScore,
    calculateSalaryScore,
    getJobRecommendations
};