const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const jobsRoutes = require('./routes/jobs');
const candidateAuthRoutes = require('./routes/candidateAuth');
const applicationsRoutes = require('./routes/applications');
const companyAuthRoutes = require('./routes/companyAuth');
const assessmentRoutes = require('./routes/assessment');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url);
    console.log('BODY:', req.body);
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'SkillProof AI Backend is running!',
    });
});

app.use('/api/candidate', candidateAuthRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/company', companyAuthRoutes);
app.use('/api/assessments', assessmentRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(
                `SkillProof AI Backend running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });