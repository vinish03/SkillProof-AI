const express = require('express');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');

const router = express.Router();

// Company signup
router.post('/signup', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            industry,
            companySize,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Company name, email and password are required',
            });
        }

        const existingCompany = await Company.findOne({ email });

        if (existingCompany) {
            return res.status(400).json({
                message: 'Company already exists with this email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const company = await Company.create({
            name,
            email,
            password: hashedPassword,
            industry: industry || '',
            companySize: companySize || '',
        });

        res.status(201).json({
            message: 'Company account created successfully',
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
                industry: company.industry,
                companySize: company.companySize,
            },
        });
    } catch (error) {
        console.error('Company signup error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Company login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            company.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        res.status(200).json({
            message: 'Login successful',
            company: {
                id: company._id,
                name: company.name,
                email: company.email,
                industry: company.industry,
                companySize: company.companySize,
            },
        });
    } catch (error) {
        console.error('Company login error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

module.exports = router;