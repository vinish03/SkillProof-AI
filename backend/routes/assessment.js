const express = require('express');
const Assessment = require('../models/Assessment');
const Job = require('../models/Job');
const AssessmentResult = require('../models/AssessmentResult');

const router = express.Router();

// Create assessment
router.post('/', async (req, res) => {
    try {
        const {
            jobId,
            company,
            title,
            description,
            duration,
            passingScore,
            questions,
        } = req.body;

        if (
            !jobId ||
            !company ||
            !title ||
            !duration ||
            !questions ||
            questions.length === 0
        ) {
            return res.status(400).json({
                message:
                    'Job, company, title, duration and questions are required',
            });
        }

        const assessment = await Assessment.create({
            jobId,
            company,
            title,
            description: description || '',
            duration,
            passingScore: passingScore || 60,
            questions,
            status: 'draft',
        });

        res.status(201).json({
            message: 'Assessment created successfully',
            assessment,
        });
    } catch (error) {
        console.error('Create assessment error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get assessments created by a company
router.get('/company/:companyName', async (req, res) => {
    try {
        const assessments = await Assessment.find({
            company: req.params.companyName,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            assessments,
        });
    } catch (error) {
        console.error('Get company assessments error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Generate questions from job skills
router.get('/generate/:jobId', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
            });
        }

        const questionBank = {
            React: [
                {
                    question:
                        'Which React hook is used to manage state in a functional component?',
                    options: [
                        'useState',
                        'useEffect',
                        'useContext',
                        'useRef',
                    ],
                    correctAnswer: 'useState',
                    points: 1,
                },
                {
                    question:
                        'Which hook is commonly used for side effects in React?',
                    options: [
                        'useEffect',
                        'useState',
                        'useMemo',
                        'useRef',
                    ],
                    correctAnswer: 'useEffect',
                    points: 1,
                },
            ],

            'Node.js': [
                {
                    question:
                        'Which runtime allows JavaScript to run outside the browser?',
                    options: [
                        'Node.js',
                        'React',
                        'MongoDB',
                        'Express',
                    ],
                    correctAnswer: 'Node.js',
                    points: 1,
                },
                {
                    question:
                        'Which module can be used to create an HTTP server in Node.js?',
                    options: [
                        'http',
                        'fs',
                        'path',
                        'events',
                    ],
                    correctAnswer: 'http',
                    points: 1,
                },
            ],

            Express: [
                {
                    question:
                        'Which method is used to create a GET route in Express?',
                    options: [
                        'app.get()',
                        'app.fetch()',
                        'app.request()',
                        'app.routeGet()',
                    ],
                    correctAnswer: 'app.get()',
                    points: 1,
                },
                {
                    question:
                        'What is Express middleware used for?',
                    options: [
                        'Processing requests before the final response',
                        'Creating databases',
                        'Styling web pages',
                        'Compiling React',
                    ],
                    correctAnswer:
                        'Processing requests before the final response',
                    points: 1,
                },
            ],

            MongoDB: [
                {
                    question:
                        'What type of database is MongoDB?',
                    options: [
                        'Document database',
                        'Relational database',
                        'Graph database',
                        'Key-value database',
                    ],
                    correctAnswer: 'Document database',
                    points: 1,
                },
                {
                    question:
                        'What format is used internally by MongoDB to store documents?',
                    options: [
                        'BSON',
                        'HTML',
                        'CSV',
                        'XML',
                    ],
                    correctAnswer: 'BSON',
                    points: 1,
                },
            ],

            Python: [
                {
                    question:
                        'Which keyword is used to define a function in Python?',
                    options: [
                        'def',
                        'function',
                        'func',
                        'define',
                    ],
                    correctAnswer: 'def',
                    points: 1,
                },
                {
                    question:
                        'Which data type is used to store an ordered, mutable collection in Python?',
                    options: [
                        'List',
                        'Tuple',
                        'Set',
                        'Dictionary',
                    ],
                    correctAnswer: 'List',
                    points: 1,
                },
            ],

            Django: [
                {
                    question:
                        'Which file is commonly used to define URL patterns in a Django application?',
                    options: [
                        'urls.py',
                        'routes.py',
                        'paths.js',
                        'config.json',
                    ],
                    correctAnswer: 'urls.py',
                    points: 1,
                },
                {
                    question:
                        'Which command is commonly used to start the Django development server?',
                    options: [
                        'python manage.py runserver',
                        'django start',
                        'python django.py',
                        'npm run django',
                    ],
                    correctAnswer:
                        'python manage.py runserver',
                    points: 1,
                },
            ],

            'REST API': [
                {
                    question:
                        'Which HTTP method is commonly used to create a new resource in a REST API?',
                    options: [
                        'GET',
                        'POST',
                        'DELETE',
                        'PATCH',
                    ],
                    correctAnswer: 'POST',
                    points: 1,
                },
                {
                    question:
                        'Which HTTP status code normally indicates a successful request?',
                    options: [
                        '200',
                        '404',
                        '500',
                        '301',
                    ],
                    correctAnswer: '200',
                    points: 1,
                },
            ],

            SQL: [
                {
                    question:
                        'Which SQL statement is used to retrieve data from a database?',
                    options: [
                        'SELECT',
                        'INSERT',
                        'UPDATE',
                        'DELETE',
                    ],
                    correctAnswer: 'SELECT',
                    points: 1,
                },
                {
                    question:
                        'Which SQL clause is used to filter rows based on a condition?',
                    options: [
                        'WHERE',
                        'ORDER BY',
                        'GROUP BY',
                        'FROM',
                    ],
                    correctAnswer: 'WHERE',
                    points: 1,
                },
            ],
        };

        let questions = [];

        for (const skill of job.skills || []) {
            if (questionBank[skill]) {
                questions.push(...questionBank[skill]);
            }
        }

        if (questions.length === 0) {
            questions = [
                {
                    question:
                        'Which HTTP method is commonly used to create a new resource?',
                    options: [
                        'GET',
                        'POST',
                        'PUT',
                        'DELETE',
                    ],
                    correctAnswer: 'POST',
                    points: 1,
                },
            ];
        }

        questions = questions.slice(0, 10);

        res.status(200).json({
            message: 'Questions generated successfully',
            job: {
                id: job._id,
                title: job.title,
                skills: job.skills,
            },
            questions,
        });
    } catch (error) {
        console.error(
            'Generate assessment questions error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get published assessments for candidates
router.get('/published', async (req, res) => {
    try {
        const assessments = await Assessment.find({
            status: 'published',
        }).sort({ createdAt: -1 });

        res.status(200).json({
            assessments,
        });
    } catch (error) {
        console.error(
            'Get published assessments error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Save candidate assessment result
router.post('/:assessmentId/result', async (req, res) => {
    try {
        const { candidateId, answers } = req.body;

        if (!candidateId || !Array.isArray(answers)) {
            return res.status(400).json({
                message:
                    'Candidate ID and answers are required',
            });
        }

        const assessment = await Assessment.findById(
            req.params.assessmentId
        );

        if (!assessment) {
            return res.status(404).json({
                message: 'Assessment not found',
            });
        }

        let score = 0;
        let totalPoints = 0;

        const checkedAnswers = assessment.questions.map(
            (question, index) => {
                const submitted = answers.find(
                    (answer) =>
                        answer.questionIndex === index
                );

                const selectedAnswer =
                    submitted?.selectedAnswer || '';

                const correct =
                    selectedAnswer ===
                    question.correctAnswer;

                totalPoints += question.points;

                if (correct) {
                    score += question.points;
                }

                return {
                    questionIndex: index,
                    selectedAnswer,
                    correct,
                    points: correct
                        ? question.points
                        : 0,
                };
            }
        );

        const percentage =
            totalPoints > 0
                ? Math.round(
                      (score / totalPoints) * 100
                  )
                : 0;

        const passed =
            percentage >= assessment.passingScore;

        const result =
            await AssessmentResult.create({
                assessmentId: assessment._id,
                candidateId,
                jobId: assessment.jobId,
                company: assessment.company,
                score,
                totalPoints,
                percentage,
                passed,
                answers: checkedAnswers,
            });

        res.status(201).json({
            message:
                'Assessment result saved successfully',
            result,
        });
    } catch (error) {
        console.error(
            'Save assessment result error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Get assessment by ID
router.get('/:assessmentId', async (req, res) => {
    try {
        const assessment = await Assessment.findById(
            req.params.assessmentId
        );

        if (!assessment) {
            return res.status(404).json({
                message: 'Assessment not found',
            });
        }

        res.status(200).json({
            assessment,
        });
    } catch (error) {
        console.error('Get assessment error:', error);

        res.status(500).json({
            message: 'Server error',
        });
    }
});
// Update assessment
router.put('/:assessmentId/edit', async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            passingScore,
            questions,
        } = req.body;

        if (
            !title ||
            !duration ||
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            return res.status(400).json({
                message:
                    'Title, duration and questions are required',
            });
        }

        const assessment =
            await Assessment.findByIdAndUpdate(
                req.params.assessmentId,
                {
                    title,
                    description: description || '',
                    duration,
                    passingScore:
                        passingScore || 60,
                    questions,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!assessment) {
            return res.status(404).json({
                message: 'Assessment not found',
            });
        }

        res.status(200).json({
            message:
                'Assessment updated successfully',
            assessment,
        });
    } catch (error) {
        console.error(
            'Update assessment error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});
// Publish assessment
router.put('/:assessmentId/publish', async (req, res) => {
    try {
        const assessment =
            await Assessment.findByIdAndUpdate(
                req.params.assessmentId,
                {
                    status: 'published',
                },
                {
                    new: true,
                }
            );

        if (!assessment) {
            return res.status(404).json({
                message: 'Assessment not found',
            });
        }

        res.status(200).json({
            message:
                'Assessment published successfully',
            assessment,
        });
    } catch (error) {
        console.error(
            'Publish assessment error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

// Delete assessment
router.delete('/:assessmentId', async (req, res) => {
    try {
        const assessment =
            await Assessment.findByIdAndDelete(
                req.params.assessmentId
            );

        if (!assessment) {
            return res.status(404).json({
                message: 'Assessment not found',
            });
        }

        res.status(200).json({
            message:
                'Assessment deleted successfully',
        });
    } catch (error) {
        console.error(
            'Delete assessment error:',
            error
        );

        res.status(500).json({
            message: 'Server error',
        });
    }
});

module.exports = router;