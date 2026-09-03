const express = require('express');
const Application = require('../models/Application');
const AssessmentResult = require('../models/AssessmentResult');
const Candidate = require('../models/Candidate');

const router = express.Router();

// Apply for a job
router.post('/apply', async (req, res) => {
    try {
        const {
            candidateId,
            jobId,
            candidateName,
            candidateEmail,
            jobTitle,
            company,
        } = req.body;

        if (
            !candidateId ||
            !jobId ||
            !candidateName ||
            !candidateEmail ||
            !jobTitle ||
            !company
        ) {
            return res.status(400).json({
                message: 'All application details are required',
            });
        }

        const existingApplication = await Application.findOne({
            candidateId,
            jobId,
        });

        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied for this job',
            });
        }

        const application = await Application.create({
            candidateId,
            candidateName,
            candidateEmail,
            jobId,
            jobTitle,
            company,
            status: 'Applied',
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application,
        });
    } catch (error) {
        console.error('Apply job error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get all applications for a candidate
router.get('/candidate/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;

        const applications = await Application.find({
            candidateId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            applications,
        });
    } catch (error) {
        console.error(
            'Get candidate applications error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get all applications for a company
router.get('/company/:companyName', async (req, res) => {
    try {
        const { companyName } = req.params;

        const applications = await Application.find({
            company: companyName,
        }).sort({ createdAt: -1 });

        const applicationsWithDetails =
            await Promise.all(
                applications.map(async (application) => {
                    const assessmentResult =
                        await AssessmentResult.findOne({
                            candidateId:
                                application.candidateId,
                            jobId: application.jobId,
                            company: application.company,
                        }).sort({ createdAt: -1 });

                    const candidate =
                        await Candidate.findById(
                            application.candidateId
                        ).select(
                            'name email skills education resume'
                        );

                    return {
                        ...application.toObject(),
                        candidateProfile: candidate || null,
                        assessmentResult:
                            assessmentResult || null,
                    };
                })
            );

        res.status(200).json({
            applications: applicationsWithDetails,
        });
    } catch (error) {
        console.error(
            'Get company applications error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Update application status
router.put('/:applicationId/status', async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            'Applied',
            'Under Review',
            'Shortlisted',
            'Rejected',
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid application status',
            });
        }

        const application =
            await Application.findByIdAndUpdate(
                applicationId,
                { status },
                { new: true }
            );

        if (!application) {
            return res.status(404).json({
                message: 'Application not found',
            });
        }

        res.status(200).json({
            message:
                'Application status updated successfully',
            application,
        });
    } catch (error) {
        console.error(
            'Update application status error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

module.exports = router;
