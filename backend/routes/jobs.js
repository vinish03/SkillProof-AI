const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        res.status(200).json({
            jobs,
        });
    } catch (error) {
        console.error('Get jobs error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get all jobs posted by a company
router.get('/company/:companyName', async (req, res) => {
    try {
        const { companyName } = req.params;

        const jobs = await Job.find({
            company: companyName,
        }).sort({ createdAt: -1 });
        console.log('COMPANY NAME:', companyName);
console.log('JOBS FOUND:', jobs);

        res.status(200).json({
            jobs,
        });
    } catch (error) {
        console.error('Get company jobs error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Add a job
router.post('/', async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            description,
            skills,
            salary,
            experience,
        } = req.body;

        if (!title || !company || !location || !description) {
            return res.status(400).json({
                message:
                    'Title, company, location and description are required',
            });
        }

        const job = await Job.create({
            title,
            company,
            location,
            description,
            skills: skills || [],
            salary: salary || '',
            experience: experience || 'Fresher',
        });

        res.status(201).json({
            message: 'Job created successfully',
            job,
        });
    } catch (error) {
        console.error('Create job error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Update a job
router.put('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const {
            title,
            location,
            description,
            skills,
            salary,
            experience,
        } = req.body;

        if (!title || !location || !description) {
            return res.status(400).json({
                message:
                    'Title, location and description are required',
            });
        }

        const job = await Job.findByIdAndUpdate(
            jobId,
            {
                title,
                location,
                description,
                skills: skills || [],
                salary: salary || '',
                experience: experience || 'Fresher',
            },
            {
                new: true,
            }
        );

        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
            });
        }

        res.status(200).json({
            message: 'Job updated successfully',
            job,
        });
    } catch (error) {
        console.error('Update job error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Delete a job
router.delete('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
            });
        }

        res.status(200).json({
            message: 'Job deleted successfully',
        });
    } catch (error) {
        console.error('Delete job error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

module.exports = router;