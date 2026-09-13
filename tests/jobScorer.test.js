const {
    scoreJob,
    calculateExperienceScore,
    calculateSalaryScore
} = require("../src/controllers/jobScore.controller");

const candidate = {
    skills: ["javascript", "react", "node.js"],
    yearsOfExperience: 2,
    location: "Gurugram",
    expectedSalary: 900000
};

const job = {
    title: "Full Stack Developer",
    requiredSkills: [
        { name: "javascript", type: "must-have" },
        { name: "react", type: "must-have" },
        { name: "node.js", type: "must-have" },
        { name: "docker", type: "nice-to-have" }
    ],
    minYearsExperience: 3,
    location: "Gurugram",
    salaryRange: {
        min: 700000,
        max: 1200000
    },
    remoteAllowed: true
};

describe("Job Scoring", () => {

    test("should reject job when must-have skill is missing", () => {
        const candidateWithoutReact = {
            ...candidate,
            skills: ["javascript", "node.js"]
        };

        const result = scoreJob(candidateWithoutReact, job);

        expect(result.eligible).toBe(false);
        expect(result.score).toBe(0);
        expect(result.missingMustHave).toContain("react");
    });

    test("should allow job when nice-to-have skill is missing", () => {
        const result = scoreJob(candidate, job);

        expect(result.eligible).toBe(true);
    });

    test("should penalize candidate below minimum experience", () => {
        const result = calculateExperienceScore(candidate, job);

        expect(result.score).toBeCloseTo(13.33, 2);
        expect(result.maxScore).toBe(20);
    });

    test("should give zero salary score when job max is below expectation", () => {
        const lowSalaryJob = {
            ...job,
            salaryRange: {
                min: 500000,
                max: 700000
            }
        };

        const result = calculateSalaryScore(candidate, lowSalaryJob);

        expect(result.score).toBe(0);
    });

    test("should calculate a valid complete score", () => {
        const result = scoreJob(candidate, job);

        expect(result.eligible).toBe(true);
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(100);

        expect(result.breakdown).toHaveProperty("skills");
        expect(result.breakdown).toHaveProperty("experience");
        expect(result.breakdown).toHaveProperty("location");
        expect(result.breakdown).toHaveProperty("salary");
    });
});