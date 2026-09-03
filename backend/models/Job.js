const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        company: {
            type: String,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        skills: {
            type: [String],
            default: [],
        },

        salary: {
            type: String,
            default: '',
        },

        experience: {
            type: String,
            default: 'Fresher',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Job', jobSchema);