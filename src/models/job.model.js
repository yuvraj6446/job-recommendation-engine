const mongoose = require("mongoose");

const requiredSkillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        type: {
            type: String,
            required: true,
            enum: ["must-have", "nice-to-have"]
        }
    },
    {
        _id: false
    }
);

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        requiredSkills: {
            type: [requiredSkillSchema],
            required: true
        },

        minYearsExperience: {
            type: Number,
            required: true,
            min: 0
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        salaryRange: {
            min: {
                type: Number,
                required: true,
                min: 0
            },

            max: {
                type: Number,
                required: true,
                min: 0
            }
        },

        remoteAllowed: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Job", jobSchema);