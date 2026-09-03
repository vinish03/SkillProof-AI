const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
        },

        options: {
            type: [String],
            required: true,
        },

        correctAnswer: {
            type: String,
            required: true,
        },

        points: {
            type: Number,
            default: 1,
        },
    },
    {
        _id: false,
    }
);

const assessmentSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },

        company: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: '',
        },

        duration: {
            type: Number,
            required: true,
        },

        passingScore: {
            type: Number,
            default: 60,
        },

        questions: {
            type: [questionSchema],
            required: true,
        },

        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Assessment', assessmentSchema);