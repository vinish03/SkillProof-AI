const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');

const jobs = [
    {
        title: 'Junior Python Developer',
        company: 'TechNova Solutions',
        location: 'Hyderabad',
        description:
            'We are looking for a fresher Python developer to join our development team.',
        skills: ['Python', 'SQL', 'Git'],
        salary: '₹3 - ₹5 LPA',
        experience: 'Fresher',
    },
    {
        title: 'Frontend Developer',
        company: 'CodeWave Technologies',
        location: 'Hyderabad',
        description:
            'Looking for a frontend developer with knowledge of React and JavaScript.',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        salary: '₹3 - ₹6 LPA',
        experience: 'Fresher',
    },
    {
        title: 'MERN Stack Developer',
        company: 'InnovateHub',
        location: 'Bangalore',
        description:
            'Join our team as a MERN Stack Developer and work on modern web applications.',
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        salary: '₹4 - ₹7 LPA',
        experience: '0-1 years',
    },
];

const addJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected');

        await Job.deleteMany({});

        await Job.insertMany(jobs);

        console.log('Jobs added successfully!');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error adding jobs:', error);
    }
};

addJobs();
