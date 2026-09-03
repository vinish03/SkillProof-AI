const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema(
    {
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment',
            required: true,
        },

        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required: true,
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },

        company: {
            type: String,
            required: true,
        },

        score: {
            type: Number,
            required: true,
        },

        totalPoints: {
            type: Number,
            required: true,
        },

        percentage: {
            type: Number,
            required: true,
        },

        passed: {
            type: Boolean,
            required: true,
        },

        answers: {
            type: [
                {
                    questionIndex: Number,
                    selectedAnswer: String,
                    correct: Boolean,
                    points: Number,
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    'AssessmentResult',
    assessmentResultSchema
);