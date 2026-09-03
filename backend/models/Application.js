const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
            required: true,
        },

        candidateName: {
            type: String,
            required: true,
        },

        candidateEmail: {
            type: String,
            required: true,
        },

        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },

        jobTitle: {
            type: String,
            required: true,
        },

        company: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                'Applied',
                'Under Review',
                'Shortlisted',
                'Rejected',
            ],
            default: 'Applied',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    'Application',
    applicationSchema
);

