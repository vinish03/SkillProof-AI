const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Candidate = require('../models/Candidate');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(
            null,
            `resume-${req.params.id}-${Date.now()}${extension}`
        );
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (extension === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, skills, education } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required',
            });
        }

        const existingCandidate = await Candidate.findOne({ email });

        if (existingCandidate) {
            return res.status(400).json({
                message: 'Candidate already exists with this email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const candidate = await Candidate.create({
            name,
            email,
            password: hashedPassword,
            skills: skills || [],
            education: education || '',
        });

        res.status(201).json({
            message: 'Candidate account created successfully',
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                skills: candidate.skills,
                education: candidate.education,
            },
        });
    } catch (error) {
        console.error('Candidate signup error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        const candidate = await Candidate.findOne({ email });

        if (!candidate) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            candidate.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        res.status(200).json({
            message: 'Login successful',
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                skills: candidate.skills,
                education: candidate.education,
            },
        });
    } catch (error) {
        console.error('Candidate login error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

router.get('/profile/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).select(
            '-password'
        );

        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
            });
        }

        res.status(200).json({
            candidate,
        });
    } catch (error) {
        console.error('Candidate profile error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

router.put('/profile/:id', async (req, res) => {
    try {
        const { name, skills, education } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required',
            });
        }

        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                skills: Array.isArray(skills) ? skills : [],
                education: education || '',
            },
            {
                new: true,
                runValidators: true,
            }
        ).select('-password');

        if (!candidate) {
            return res.status(404).json({
                message: 'Candidate not found',
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            candidate,
        });
    } catch (error) {
        console.error('Candidate profile update error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

router.post(
    '/profile/:id/resume',
    (req, res, next) => {
        upload.single('resume')(req, res, (error) => {
            if (error) {
                console.error('Resume upload error:', error.message);

                return res.status(400).json({
                    message: error.message,
                });
            }

            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Please select a PDF resume',
                });
            }

            const candidate = await Candidate.findByIdAndUpdate(
                req.params.id,
                {
                    resume: req.file.filename,
                },
                {
                    new: true,
                }
            ).select('-password');

            if (!candidate) {
                return res.status(404).json({
                    message: 'Candidate not found',
                });
            }

            res.status(200).json({
                message: 'Resume uploaded successfully',
                candidate,
            });
        } catch (error) {
            console.error('Resume save error:', error);

            res.status(500).json({
                message: 'Failed to save resume',
            });
        }
    }
);

module.exports = router;